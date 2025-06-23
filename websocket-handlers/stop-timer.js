const jwt = require('jsonwebtoken');

module.exports = async function handleStopTimer({ ws, payload, clearDraftTimer, broadcastToLeague }) {
  const { token } = payload;

  // Verify admin token (you might want to add admin verification here)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add admin check if needed: if (!decoded.isAdmin) throw new Error("Not admin");
  } catch (err) {
    console.warn("Invalid token on stop timer");
    ws.send(JSON.stringify({ type: 'error', message: 'unauthorized' }));
    return;
  }

  try {
    clearDraftTimer(ws.leagueId);
    
    broadcastToLeague(ws.leagueId, {
      type: 'draft-timer-stopped',
      payload: {}
    });
    
    ws.send(JSON.stringify({ 
      type: 'timer-stopped', 
      payload: {} 
    }));

  } catch (err) {
    console.error('Error stopping timer:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to stop timer',
    }));
  }
};
