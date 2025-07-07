const sequelize = require('../config/connection');
const { League, Team, Player, Draft, DraftPick, PlayerTeam } = require('../models');
const { Op } = require('sequelize');

async function liveDraftData(leagueId) {
  
    const season = process.env.CURRENT_SEASON;
    console.log(`liveDraftData debug for league ${leagueId}, season ${season}`);

    const league = await League.findByPk(leagueId);
    const teams = await Team.findAll({ where: { leagueId } });
    const players = await Player.findAll({ where: { season }, order: [['firstName', 'ASC']]});
    console.log(`Found ${players.length} players for season ${season}`);
    
    const draft = await Draft.findOne({ where: { leagueId, season } }).then(dbData => dbData.get({plain: true}));
    const draftOrder = await DraftPick.findAll({
      where: { draftId: draft.draftId },
      order: [['pickNumber', 'ASC']],
      include: [{
        model: Team,
        as: 'team',
        include: ['owner']
      }, 'player', 'draft'],
      attributes: {
        include: [
          [sequelize.literal(`draftPick.pickNumber = draft.currentPick`), 'currentPick']
        ]
      }
    });

    const picks = draftOrder.filter(p => p.playerId !== null); // Completed picks
    
    // Get all players that are actually assigned to teams in THIS league
    const teamIds = teams.map(team => team.teamId);
    const assignedPlayers = await PlayerTeam.findAll({
      where: {
        teamId: {
          [Op.in]: teamIds
        }
      },
      attributes: ['playerId']
    });
    const assignedPlayerIds = new Set(assignedPlayers.map(assignment => assignment.playerId));
    
    // Filter players to only those not assigned to any team
    const availablePlayers = players.filter(player => !assignedPlayerIds.has(player.playerId));
    
    // Keep the old logic for backwards compatibility (draft picks)
    const pickedPlayerIds = new Set(draftOrder.filter(p => p.playerId).map(p => p.playerId));
    
    console.log(`Completed picks: ${picks.length}, Total assigned players: ${assignedPlayers.length}, Available players: ${availablePlayers.length}`);

    return {league, teams, players, draft, draftOrder, picks, pickedPlayerIds, availablePlayers};

}

module.exports = { liveDraftData };