const router = require('express').Router();

const ownerAccessRoute = require('./ownerAccess');
router.use('/ownerAccess', ownerAccessRoute);

const notMyLeaguesRoute = require('./notMyLeagues');
router.use('/notMyLeagues', notMyLeaguesRoute);

const joinRoute = require('./join');
router.use('/join', joinRoute);

const addRoute = require('./add');
router.use('/add', addRoute);

const rootRoute = require('./root');
router.use('/', rootRoute);

module.exports = router;