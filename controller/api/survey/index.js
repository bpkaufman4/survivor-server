const router = require('express').Router();

const rootRoute = require('./root');
router.use('/', rootRoute);

const latestRoute = require('./latest');
router.use('/latest', latestRoute);

const submitRoute = require('./submit');
router.use('/submit', submitRoute);

module.exports = router;