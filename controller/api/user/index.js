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

const fcmTokenRoute = require('./fcm-token');
router.use('/fcm-token', fcmTokenRoute);

const testPushRoute = require('./test-push');
router.use('/test-push', testPushRoute);

const devicesRoute = require('./devices');
router.use('/devices', devicesRoute);

module.exports = router;