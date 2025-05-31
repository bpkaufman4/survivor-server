const router = require('express').Router();

const latestRoute = require('./latest');
router.use('/latest', latestRoute);

const rootRoute = require('./root');
router.use('/', rootRoute);

module.exports = router;