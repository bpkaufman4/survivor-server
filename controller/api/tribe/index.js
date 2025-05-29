const router = require('express').Router();

const rootRoutes = require('./root');
router.use('/', rootRoutes);

module.exports = router;