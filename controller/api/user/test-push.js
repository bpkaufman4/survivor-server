const { sendPushNotificationToUser } = require('../../../helpers/pushNotifications');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    // Get user ID from JWT token
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    // Send test push notification to all user devices
    const notification = {
      title: 'Test Notification',
      body: 'This is a test push notification from React Survivor!'
    };
    
    const data = {
      type: 'test',
      url: '/',
      timestamp: new Date().toISOString()
    };
    
    const result = await sendPushNotificationToUser(userId, notification, data);
    
    if (result.success) {
      res.json({ 
        status: 'success', 
        message: 'Test push notification sent to all devices',
        result: result.response 
      });
    } else {
      res.json({ 
        status: 'fail', 
        message: result.message || 'Failed to send push notification',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending test push notification:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to send test push notification' });
  }
};
