// websocket.js
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const clientsByLeague = new Map();
const draftTimers = new Map();
const draftScheduleCheckers = new Map(); // Track scheduled draft checkers

const handlers = {};
const handlersPath = path.join(__dirname, 'websocket-handlers');
fs.readdirSync(handlersPath).forEach((file) => {
  const name = path.basename(file, '.js');
  handlers[name] = require(path.join(handlersPath, file));
});

// Function to check and start scheduled drafts
async function checkScheduledDrafts() {
  try {
    const { Draft } = require('./models');
    const { liveDraftData } = require('./websocket-handlers/helpers');
    
    const now = new Date();
    
    // Find drafts that should have started but haven't been completed
    const scheduledDrafts = await Draft.findAll({
      where: {
        startDate: {
          [require('sequelize').Op.lte]: now // Start date is in the past or now
        },
        complete: false
      }
    });

    for (const draft of scheduledDrafts) {
      // Check if timer is already running for this league
      if (draftTimers.has(draft.leagueId)) {
        continue; // Skip if timer already active
      }

      try {
        const draftData = await liveDraftData(draft.leagueId);
        const currentPickObj = draftData.draftOrder.find(pick => pick.dataValues.currentPick);
          // Start timer if there's a current pick waiting
        if (currentPickObj && !currentPickObj.playerId && !draftData.draft.complete) {
          console.log(`Auto-starting draft timer for league ${draft.leagueId} (scheduled start: ${draft.startDate})`);
          const timerMs = (draftData.draft.pickTimeSeconds || 120) * 1000; // Convert to milliseconds
          startDraftTimer(draft.leagueId, timerMs);
        }
      } catch (err) {
        console.error(`Error checking scheduled draft for league ${draft.leagueId}:`, err);
      }
    }
  } catch (err) {
    console.error('Error in checkScheduledDrafts:', err);
  }
}

// Start periodic checking for scheduled drafts (every 30 seconds)
setInterval(checkScheduledDrafts, 30000);

function setupWebSocket(server) {
  
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      let message;
      try {
        message = JSON.parse(data);
      } catch {
        return ws.send(JSON.stringify({ error: 'Invalid JSON' }));
      }

      const { type, payload } = message;
      const handler = handlers[type];      if (handler) {
        handler({ ws, payload, clientsByLeague, wss, broadcastToLeague, clearDraftTimer, startDraftTimer, isTimerRunning, getTimerInfo });
      } else {
        ws.send(JSON.stringify({ error: `Unknown message type: ${type}` }));
      }
    });

    ws.on('close', () => {
      if (ws.leagueId && clientsByLeague.has(ws.leagueId)) {
        clientsByLeague.get(ws.leagueId).delete(ws);
      }
    });
  });

  console.log('WebSocket server initialized');
}

function broadcastToLeague(leagueId, message) {
  const clients = clientsByLeague.get(leagueId);
  if (!clients) return;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

function clearDraftTimer(leagueId) {
  const timerData = draftTimers.get(leagueId);
  if(timerData && timerData.timeout) {
    clearTimeout(timerData.timeout);
    draftTimers.delete(leagueId);
    console.log(`Cleared draft timer for league ${leagueId}`);
  }
}

function isTimerRunning(leagueId) {
  return draftTimers.has(leagueId);
}

function getTimerInfo(leagueId) {
  const timer = draftTimers.get(leagueId);
  if (!timer) return null;
  return { startTime: timer.startTime, timeoutMs: timer.timeoutMs };
}

function startDraftTimer(leagueId, timeoutMs) {
  // Clear any existing timer for this league
  clearDraftTimer(leagueId);

  // If no timeout provided, fetch from draft settings
  const getTimeoutMs = async () => {
    if (timeoutMs) return timeoutMs;
    
    try {
      const { Draft } = require('./models');
      const draft = await Draft.findOne({ 
        where: { leagueId, season: process.env.CURRENT_SEASON } 
      });
      return draft ? (draft.pickTimeSeconds * 1000) : 120000; // Fallback to 2 minutes
    } catch (err) {
      console.error('Error fetching draft timeout:', err);
      return 120000; // Fallback to 2 minutes
    }
  };  getTimeoutMs().then(finalTimeoutMs => {
    const startTime = Date.now();
    const timeout = setTimeout(async () => {
      console.log(`Draft timer expired for league ${leagueId}, making auto pick`);
      
      try {
        // Import the handler and helper here to avoid circular dependency
        const { liveDraftData } = require('./websocket-handlers/helpers');
        const handlePick = require('./websocket-handlers/pick');
        
        // Get current draft state
        const draftData = await liveDraftData(leagueId);
        const currentPickObj = draftData.draftOrder.find(pick => pick.dataValues.currentPick);
        
        if (!currentPickObj || currentPickObj.playerId) {
          console.log('No current pick found or pick already made');
          return;
        }
        
        // Select a random available player
        const availablePlayers = draftData.availablePlayers;
        if (availablePlayers.length === 0) {
          console.log('No available players for auto pick');        
          return;
        }
        
        const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
        console.log(`Auto-picking player: ${randomPlayer.firstName} ${randomPlayer.lastName}`);
          // Find a client for this league to use for the auto pick
        const clients = clientsByLeague.get(leagueId);
        let ws;
        
        if (clients && clients.size > 0) {
          // Use an existing client if available
          ws = Array.from(clients)[0];
        } else {
          // Create a mock websocket object if no clients are connected
          console.log('No clients connected, creating mock websocket for auto pick');
          ws = {
            send: () => {}, // Mock send function
            leagueId: leagueId
          };
        }
        
        ws.leagueId = leagueId;
        ws.myTeam = {
          teamId: currentPickObj.teamId,
          ownerId: currentPickObj.team?.ownerId || currentPickObj.team?.owner?.userId
        };
        
        // Make the auto pick
        await handlePick({
          ws,
          payload: {
            pick: currentPickObj,
            player: randomPlayer,
            auto: true
          },
          broadcastToLeague,
          clearDraftTimer,
          startDraftTimer,        
          clientsByLeague
        });
        
        // Broadcast that an auto pick was made
        broadcastToLeague(leagueId, {
          type: 'auto-pick-made',
          payload: {
            player: randomPlayer,
            team: currentPickObj.team,
            pickNumber: currentPickObj.pickNumber
          }
        });      
      } catch (error) {
        console.error('Error making auto pick:', error);
        // Only delete timer on error, otherwise handlePick manages the timer
        draftTimers.delete(leagueId);
      }
    }, finalTimeoutMs);
    
    draftTimers.set(leagueId, { timeout, startTime, timeoutMs: finalTimeoutMs });

    // Broadcast timer started to all clients
    broadcastToLeague(leagueId, {
      type: 'draft-timer-started',
      payload: {
        timeoutMs: finalTimeoutMs,
        startTime
      }
    });
  });
}

module.exports = {
  setupWebSocket,
  broadcastToLeague,
  clearDraftTimer,
  startDraftTimer,
  isTimerRunning,
  getTimerInfo
};
