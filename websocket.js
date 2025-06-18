// websocket.js
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const clientsByLeague = new Map();

const handlers = {};
const handlersPath = path.join(__dirname, 'websocket-handlers');
fs.readdirSync(handlersPath).forEach((file) => {
  const name = path.basename(file, '.js');
  handlers[name] = require(path.join(handlersPath, file));
});

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
      const handler = handlers[type];

      if (handler) {
        handler({ ws, payload, clientsByLeague, wss });
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

// Optional: expose for other modules to use broadcast
module.exports = {
  setupWebSocket,
  broadcastToLeague,
};
