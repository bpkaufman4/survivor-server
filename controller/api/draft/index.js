const router = require('express').Router();

const rootRoute = require('./root');
router.use('/', rootRoute);

const byLeagueRoute = require('./byLeague');
router.use('/byLeague', byLeagueRoute);

const generateRoute = require('./generate');
router.use('/generate', generateRoute);

module.exports = router;