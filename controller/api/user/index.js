const router = require('express').Router();

const rootRoute = require('./root');
router.use('/', rootRoute);

const meRoute = require('./me');
router.use('/me', meRoute);

const registerRoute = require('./register');
router.use('/register', registerRoute);

const verifyEmailRoute = require('./verify-email');
router.use('/verify-email', verifyEmailRoute);

const resendVerificationRoute = require('./resend-verification');
router.use('/resend-verification', resendVerificationRoute);

const updateEmailRoute = require('./update-email');
router.use('/update-email', updateEmailRoute);

module.exports = router;