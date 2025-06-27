const jwt = require('jsonwebtoken');
const { liveDraftData } = require('./helpers');

module.exports = async function handleStartTimer({ ws, payload, startDraftTimer }) {
  const { token, timeoutMs } = payload;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.warn("Invalid token on start timer");
    ws.send(JSON.stringify({ type: 'error', message: 'unauthorized' }));
    return;
  }

  try {
    const draftData = await liveDraftData(ws.leagueId);
    const currentPickObj = draftData.draftOrder.find(pick => pick.dataValues.currentPick);
    
    if (!currentPickObj || currentPickObj.playerId || draftData.draft.complete) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'No current pick available or draft is complete' 
      }));
      return;
    }    // Use provided timeoutMs or default to draft setting
    const finalTimeoutMs = timeoutMs || (draftData.draft.pickTimeSeconds * 1000);
    
    // Start the timer
    startDraftTimer(ws.leagueId, finalTimeoutMs);
    
    ws.send(JSON.stringify({ 
      type: 'timer-started', 
      payload: { timeoutMs: finalTimeoutMs, startTime: Date.now() } 
    }));

  } catch (err) {
    console.error('Error starting timer:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to start timer',
    }));
  }
};
