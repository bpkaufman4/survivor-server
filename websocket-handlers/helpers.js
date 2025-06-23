const sequelize = require('../config/connection');
const { League, Team, Player, Draft, DraftPick } = require('../models');

async function liveDraftData(leagueId) {
  
    const season = process.env.CURRENT_SEASON;

    const league = await League.findByPk(leagueId);
    const teams = await Team.findAll({ where: { leagueId } });
    const players = await Player.findAll({ where: { season }, order: [['firstName', 'ASC']]});
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
    const pickedPlayerIds = new Set(draftOrder.filter(p => p.playerId).map(p => p.playerId));
    const availablePlayers = players.filter(player => !pickedPlayerIds.has(player.playerId));

    return {league, teams, players, draft, draftOrder, picks, pickedPlayerIds, availablePlayers};

}

module.exports = { liveDraftData };