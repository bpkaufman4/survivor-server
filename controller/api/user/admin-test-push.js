const router = require('express').Router();
const { User, UserFcmToken } = require('../../../models');
const { sendPushNotificationToMultiple } = require('../../../helpers/pushNotifications');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  try {
    // Verify admin access
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findByPk(decoded.id);
    
    if (!adminUser || decoded.userType !== 'ADMIN') {
      return res.json({ status: 'fail', message: 'Admin access required' });
    }

    const { targetUsers, title, body, type = 'admin_test', url } = req.body;

    if (!title || !body) {
      return res.json({ status: 'fail', message: 'Title and body are required' });
    }

    let tokens = [];
    let deviceInfos = [];

    if (targetUsers === 'all') {
      // Send to all users with FCM tokens
      const allTokens = await UserFcmToken.findAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      });
      
      tokens = allTokens.map(token => token.fcmToken);
      deviceInfos = allTokens.map(token => token.deviceInfo || {});
    } else if (Array.isArray(targetUsers)) {
      // Send to specific users
      const userTokens = await UserFcmToken.findAll({
        where: { userId: targetUsers },
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      });
      
      tokens = userTokens.map(token => token.fcmToken);
      deviceInfos = userTokens.map(token => token.deviceInfo || {});
    } else {
      return res.json({ status: 'fail', message: 'Invalid target users' });
    }

    if (tokens.length === 0) {
      return res.json({ status: 'fail', message: 'No FCM tokens found for target users' });
    }

    // Send the notification
    const result = await sendPushNotificationToMultiple(
      tokens,
      { title, body },
      { type, url },
      deviceInfos
    );

    if (result.success) {
      res.json({
        status: 'success',
        message: 'Test notification sent successfully',
        devicesNotified: tokens.length,
        successCount: result.response?.successCount || 0,
        failureCount: result.response?.failureCount || 0
      });
    } else {
      res.json({
        status: 'fail',
        message: 'Failed to send notification',
        error: result.error?.message || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Error sending admin test push notification:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to send notification' });
  }
});

module.exports = router;