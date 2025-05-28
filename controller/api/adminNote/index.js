const router = require('express').Router();

const latestRoute = require('./latest');
router.use('/latest', latestRoute);

module.exports = router;