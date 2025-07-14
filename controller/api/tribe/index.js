const router = require('express').Router();

const rootRoutes = require('./root');
router.use('/', rootRoutes);

const adminRoutes = require('./admin');
router.use('/admin', adminRoutes);

module.exports = router;