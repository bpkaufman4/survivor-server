const router = require('express').Router();

const myTeams = require('./myTeams');
router.use('/myTeams', myTeams);

const byLeague = require('./byLeague');
router.use('/byLeague', byLeague);

module.exports = router;