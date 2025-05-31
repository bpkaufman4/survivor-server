const router = require('express').Router();

const adminRoute = require('./admin');
router.use('/admin', adminRoute);

const rootRoute = require('./root');
router.use('/', rootRoute);

module.exports = router;