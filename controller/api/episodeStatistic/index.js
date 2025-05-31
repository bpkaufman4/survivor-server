const router = require('express').Router();

const byPlayerRoute = require('./byPlayer');
router.use('/byPlayer', byPlayerRoute);

const forSetScoresRoute = require('./forSetScores');
router.use('/forSetScores', forSetScoresRoute);

const rootRoute = require('./root');
router.use('/', rootRoute);

module.exports = router;