const router = require('express').Router();

const loginRoute = require('./login');
router.use('/login', loginRoute);

const teamRoute = require('./team');
router.use('/team', teamRoute);

const playerRoute = require('./player');
router.use('/player', playerRoute);

const episodeStatisticRoute = require('./episodeStatistic');
router.use('/episodeStatistic', episodeStatisticRoute);

const leagueRoute = require('./league');
router.use('/league', leagueRoute);

const adminNoteRoute = require('./adminNote');
router.use('/adminNote', adminNoteRoute);

const tribeRoute = require('./tribe');
router.use('/tribe', tribeRoute);

const episodeRoute = require('./episode');
router.use('/episode', episodeRoute);

const surveyRoute = require('./survey');
router.use('/survey', surveyRoute);

const userRoute = require('./user');
router.use('/user', userRoute);

const statisticRoute = require('./statistic');
router.use('/statistic', statisticRoute);

const draftRoute = require('./draft');
router.use('/draft', draftRoute);

const uploadImageRoute = require('./uploadImage');
router.use('/uploadImage', uploadImageRoute);

const playersRoute = require('./players');
router.use('/players', playersRoute);

const jobsRoute = require('./jobs');
router.use('/jobs', jobsRoute);

module.exports = router;