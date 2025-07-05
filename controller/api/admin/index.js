const router = require('express').Router();

// Admin test push notification endpoint
router.post('/test-push', require('./test-push'));

// Get all users for admin interface
router.get('/users', require('./users'));

module.exports = router;
