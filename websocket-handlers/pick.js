const { PlayerTeam, DraftPick, Draft } = require("../models");
const { liveDraftData } = require("./helpers");
const { sendDraftNotification } = require("../helpers/pushNotifications");
const jwt = require('jsonwebtoken');

module.exports = async function handlePick({ ws, payload, broadcastToLeague, clearDraftTimer, startDraftTimer, clientsByLeague}) {

  const { token, pick, player, auto = false } = payload;

  // Clear any existing timer when a pick is made (manual or auto)
  clearDraftTimer(ws.leagueId);
  // Get current draft data to check if draft has started
  try {
    const draftData = await liveDraftData(ws.leagueId);
    
    // Check if draft has started (current time >= startDate)
    const now = new Date();
    const draftStartTime = new Date(draftData.draft.startDate);
    
    if (!auto && now < draftStartTime) {
      ws.send(JSON.stringify({ type: 'error', message: 'Draft has not started yet' }));
      return;
    }
    
    // Check if draft is already complete
    if (draftData.draft.complete) {
      ws.send(JSON.stringify({ type: 'error', message: 'Draft is already complete' }));
      return;
    }
  } catch (err) {
    console.error('Error checking draft status:', err);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to check draft status' }));
    return;
  }

  if(!auto) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const pickTeamOwnerId = pick?.team?.ownerId;
      
      // Check if the user making the pick is the owner of the team for this pick
      if (decoded.id !== pickTeamOwnerId) {
        throw new Error("Not your pick");
      }
    } catch (err) {
      console.warn("Invalid token on pick:", err.message);
      ws.send(JSON.stringify({ type: 'error', message: 'unauthorized' }));
      return;
    }
  }  try {
    const teamId = pick.teamId || pick.team?.teamId;
    
    // Check if this pick has already been made
    const existingPick = await DraftPick.findOne({
      where: { draftPickId: pick.draftPickId }
    });
    
    if (existingPick && existingPick.playerId) {
      console.log(`Pick ${pick.pickNumber} has already been made with player ${existingPick.playerId}`);
      ws.send(JSON.stringify({ type: 'error', message: 'This pick has already been made' }));
      return;
    }
    
    // Check if the player is already on this team
    const existingPlayerTeam = await PlayerTeam.findOne({
      where: { 
        playerId: player.playerId, 
        teamId: teamId 
      }
    });
    
    if (existingPlayerTeam) {
      console.log(`Player ${player.playerId} is already on team ${teamId}`);
      ws.send(JSON.stringify({ type: 'error', message: 'Player is already on this team' }));
      return;
    }
    
    await PlayerTeam.create({playerId: player.playerId, teamId: teamId});
    await DraftPick.update({playerId: player.playerId}, {where: {draftPickId: pick.draftPickId}});
    
    // Check if this is the last pick before updating currentPick
    const totalPicks = await DraftPick.count({where: {draftId: pick.draftId}});
    const isLastPick = pick.pickNumber >= totalPicks;
    
    if (isLastPick) {
      // Mark draft as complete
      await Draft.update({
        currentPick: pick.pickNumber + 1,
        complete: true
      }, {where: {draftId: pick.draftId}});
    } else {
      // Just update current pick
      await Draft.update({currentPick: (pick.pickNumber + 1)}, {where: {draftId: pick.draftId}});
    }
  } catch (err) {
    console.error('Database error in pick handler:', err);
    ws.send(JSON.stringify({type: 'error', message: err}));
    return;
  }

  try {

    var draftData = await liveDraftData(ws.leagueId);

    broadcastToLeague(ws.leagueId, { type: 'pick-made', payload: draftData });    // Check if there's a next pick and start timer
    const nextPickObj = draftData.draftOrder.find(pickItem => pickItem.dataValues.currentPick);    if (nextPickObj && !nextPickObj.playerId && !draftData.draft.complete) {
      // Start timer for next pick using draft settings
      const timerMs = (draftData.draft.pickTimeSeconds || 120) * 1000; // Convert to milliseconds
      startDraftTimer(ws.leagueId, timerMs);
      
      // Send push notification to the next picker that it's their turn
      if (nextPickObj.team?.owner?.userId) {
        try {
          await sendDraftNotification(nextPickObj.team.owner.userId, {
            leagueName: draftData.league?.name || 'your league',
            leagueId: ws.leagueId
          });
          console.log(`Sent "your turn" notification to user ${nextPickObj.team.owner.userId} for pick ${nextPickObj.pickNumber}`);
        } catch (error) {
          console.error('Error sending your turn notification:', error);
        }
      }
    }

  } catch (err) {
    console.error('Error in pick handler:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to load league data',
    }));

  }
};