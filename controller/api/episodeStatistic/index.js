const router = require('express').Router();

const byPlayerRoute = require('./byPlayer');
router.use('/byPlayer', byPlayerRoute);

module.exports = router;