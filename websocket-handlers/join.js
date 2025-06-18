const { League, Team, Player, Draft, DraftPick } = require('../models');

module.exports = async function handleJoin({ ws, payload, clientsByLeague }) {
  const { leagueId } = payload;

  if (!clientsByLeague.has(leagueId)) {
    clientsByLeague.set(leagueId, new Set());
  }
  clientsByLeague.get(leagueId).add(ws);
  ws.leagueId = leagueId;

  try {
    const season = process.env.CURRENT_SEASON;

    const league = await League.findByPk(leagueId);
    const teams = await Team.findAll({ where: { leagueId } });
    const players = await Player.findAll({ where: { season }});
    const draft = await Draft.findOne({ where: { leagueId, season } }).then(dbData => dbData.get({plain: true}));
    const draftOrder = await DraftPick.findAll({
      where: { draftId: draft.draftId },
      order: [['pickNumber', 'ASC']],
    });

    const picks = draftOrder.filter(p => p.playerId !== null); // Completed picks

    ws.send(JSON.stringify({
      type: 'init',
      payload: {
        league,
        teams,
        players,
        draft,
        draftOrder,
        picks,
      },
    }));
  } catch (err) {
    console.error('Error in join handler:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to load league data',
    }));
  }
};
