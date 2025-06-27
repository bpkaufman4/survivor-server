const router = require('express').Router();

const rootRoute = require('./root');
router.use('/', rootRoute);

module.exports = router;
