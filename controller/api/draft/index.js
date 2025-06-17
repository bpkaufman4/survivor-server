const router = require('express').Router();

const rootRoute = require('./root');
router.use('/', rootRoute);

const byLeagueRoute = require('./byLeague');
router.use('/byLeague', byLeagueRoute);

module.exports = router;