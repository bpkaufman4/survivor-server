const { PlayerTeam, DraftPick, Draft } = require("../models");
const { liveDraftData } = require("./helpers");
const { sendDraftNotification } = require("../helpers/pushNotifications");
const jwt = require('jsonwebtoken');

module.exports = async function handlePick({ ws, payload, broadcastToLeague, clearDraftTimer, startDraftTimer, clientsByLeague }) {

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

  if (!auto) {
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
  } try {


    // Check if this pick has already been made
    const existingPick = await DraftPick.findOne({
      where: { draftPickId: pick.draftPickId },
      include: [
        {
          model: require('../models').Team,
          as: 'team',
          include: ['owner']
        }
      ]
    });

    if (existingPick && existingPick.playerId) {
      console.log(`Pick ${existingPick.pickNumber} has already been made with player ${existingPick.playerId}`);
      ws.send(JSON.stringify({ type: 'error', message: 'This pick has already been made' }));
      return;
    }

    if (!existingPick) {
      console.log(`Pick ${pick.draftPickId} not found`);
      ws.send(JSON.stringify({ type: 'error', message: 'Pick not found' }));
      return;
    }

    // Verify ownership again with trusted DB data
    if (!auto) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // existingPick.team might be null if not included, but we should include it
        if (existingPick.team && existingPick.team.ownerId !== decoded.id) {
          console.warn(`User ${decoded.id} tried to pick for team ${existingPick.teamId} owned by ${existingPick.team?.ownerId}`);
          ws.send(JSON.stringify({ type: 'error', message: 'Not your pick (server verified)' }));
          return;
        }
      } catch (err) {
        console.error('Token verification failed inside DB check:', err);
        // Fallthrough or return? 
      }
    }

    const teamId = existingPick.teamId; // Use trusted teamId from DB

    // Check if the player is already assigned to any team in THIS league
    const existingPlayerTeam = await PlayerTeam.findOne({
      where: {
        playerId: player.playerId
      },
      include: [
        {
          model: require('../models').Team,
          as: 'team',
          where: {
            leagueId: ws.leagueId
          }
        }
      ]
    });

    if (existingPlayerTeam) {
      console.log(`Player ${player.playerId} is already assigned to team ${existingPlayerTeam.teamId} in league ${ws.leagueId}`);
      ws.send(JSON.stringify({ type: 'error', message: 'Player is already assigned to a team' }));
      return;
    }

    await PlayerTeam.create({ playerId: player.playerId, teamId: teamId });
    await DraftPick.update({ playerId: player.playerId }, { where: { draftPickId: pick.draftPickId } });

    // Check if this is the last pick before updating currentPick
    const totalPicks = await DraftPick.count({ where: { draftId: existingPick.draftId } });
    const isLastPick = existingPick.pickNumber >= totalPicks;

    if (isLastPick) {
      // Mark draft as complete
      await Draft.update({
        currentPick: existingPick.pickNumber + 1,
        complete: true
      }, { where: { draftId: existingPick.draftId } });
    } else {
      // Just update current pick
      await Draft.update({ currentPick: (existingPick.pickNumber + 1) }, { where: { draftId: existingPick.draftId } });
    }
  } catch (err) {
    console.error('Database error in pick handler:', err);
    ws.send(JSON.stringify({ type: 'error', message: err }));
    return;
  }

  try {

    var draftData = await liveDraftData(ws.leagueId);

    broadcastToLeague(ws.leagueId, { type: 'pick-made', payload: draftData });    // Check if there's a next pick and start timer
    const nextPickObj = draftData.draftOrder.find(pickItem => pickItem.dataValues.currentPick); if (nextPickObj && !nextPickObj.playerId && !draftData.draft.complete) {
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