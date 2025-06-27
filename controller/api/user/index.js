const router = require('express').Router();

const rootRoute = require('./root');
router.use('/', rootRoute);

const meRoute = require('./me');
router.use('/me', meRoute);

const registerRoute = require('./register');
router.use('/register', registerRoute);

module.exports = router;