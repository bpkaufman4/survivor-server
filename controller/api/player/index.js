const router = require('express').Router();

const byLeagueRoute = require('./byLeague');
router.use('/byLeague', byLeagueRoute);

const byTeamRoute = require('./byTeam');
router.use('/byTeam', byTeamRoute);

const adminRoute = require('./admin');
router.use('/admin', adminRoute);

const setEliminatedRoute = require('./setEliminated');
router.use('/setEliminated', setEliminatedRoute);

const rootRoute = require('./root');
router.use('/', rootRoute);

module.exports = router;