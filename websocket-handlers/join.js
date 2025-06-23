const jwt = require('jsonwebtoken');
const { Team } = require('../models');
const { liveDraftData } = require('./helpers');

async function handleJoin({ ws, payload, clientsByLeague, startDraftTimer, isTimerRunning, getTimerInfo }) {
  const { leagueId, token } = payload;

  // verify user token 

  let userId = null;
  try{ 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    ws.userId = userId;
  } catch(err) {
    console.warn("Invalidtoken on join");
    ws.send(JSON.stringify({type: 'error', message: 'unauthorized'}));
    ws.close();
    return;
  }

  if (!clientsByLeague.has(leagueId)) {
    clientsByLeague.set(leagueId, new Set());
  }
  clientsByLeague.get(leagueId).add(ws);
  ws.leagueId = leagueId;
  
  let myTeam = null;  try {
    myTeam = await Team.findOne({where: {ownerId: userId, leagueId}});
    if(!myTeam) throw new Error("No team found");
    
    ws.myTeam = myTeam.get({plain: true});
    ws.leagueId = leagueId;
  } catch(err) {
    console.warn("No team found for user:", userId, "in league:", leagueId);
    ws.send(JSON.stringify({type: 'error', message: 'No team found'}));
    ws.close();
  }


  try {

    var draftData = await liveDraftData(leagueId)

    var payload = {...draftData, myTeam};

    ws.send(JSON.stringify({
      type: 'init',
      payload,
    }));
    // Remove timer start logic on join. Only send timer info if timer is running.
    const timerInfo = getTimerInfo(leagueId);
    if (timerInfo) {
      ws.send(JSON.stringify({
        type: 'draft-timer-started',
        payload: timerInfo
      }));
    }

  } catch (err) {
    console.error('Error in join handler:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to load league data',
    }));

  }
};


module.exports = handleJoin;