const router = require('express').Router();

const myTeamsRoute = require('./myTeams');
router.use('/myTeams', myTeamsRoute);

const myTeamRoute = require('./myTeam');
router.use('/myTeam', myTeamRoute);

const byLeagueRoute = require('./byLeague');
router.use('/byLeague', byLeagueRoute);

const forDraftRoute = require('./forDraft');
router.use('/forDraft', forDraftRoute);

module.exports = router;