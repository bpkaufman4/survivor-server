const { sendPushNotificationToUser } = require('../../../helpers/pushNotifications');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    console.log('\n=== Test Push Notification Request ===');
    console.log('Request body:', req.body);
    
    // Get user ID from JWT token
    const token = req.headers.authorization;
    if (!token) {
      console.log('❌ No authorization token provided');
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log('👤 User ID:', userId);
    
    // Use custom notification data from request body, with fallbacks
    const { title, body, type } = req.body;
    
    const notification = {
      title: title || 'Test Notification',
      body: body || 'This is a test push notification from React Survivor!'
    };
    
    const data = {
      type: type || 'test',
      url: '/',
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Sending notification:', notification);
    console.log('📊 Notification data:', data);
    
    const result = await sendPushNotificationToUser(userId, notification, data);
    console.log('📥 Notification result:', result);
    
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
