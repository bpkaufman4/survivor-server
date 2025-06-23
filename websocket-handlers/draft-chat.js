const jwt = require('jsonwebtoken');

async function handleDraftChat({ ws, payload, broadcastToLeague }) {

  try {
    broadcastToLeague(ws.leagueId, {type: 'draft-chat', payload: payload.message});
  } catch (err) {
    console.error('Error in join handler:', err);
    broadcastToLeague(ws.leagueId, {
      type: 'error',
      message: 'Failed to load league data',
    });

  }
};


module.exports = handleDraftChat;