const router = require('express').Router();

const loginRoute = require('./login');
router.use('/login', loginRoute);

const teamRoute = require('./team');
router.use('/team', teamRoute);

const playerRoute = require('./player');
router.use('/player', playerRoute);

const episodeStatisticRoute = require('./episodeStatistic');
router.use('/episodeStatistic', episodeStatisticRoute);

module.exports = router;