const { sendPushNotificationToUser } = require('../../../helpers/pushNotifications');
const { User } = require('../../../models');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    // Get user ID from JWT token and verify admin status
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findByPk(decoded.id);
    
    if (!adminUser || !adminUser.isAdmin) {
      return res.json({ status: 'fail', message: 'Admin access required' });
    }
    
    const { userIds, notification, data } = req.body;
    
    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.json({ status: 'fail', message: 'User IDs array is required' });
    }
    
    if (!notification || !notification.title || !notification.body) {
      return res.json({ status: 'fail', message: 'Notification title and body are required' });
    }
    
    // Verify all user IDs exist
    const users = await User.findAll({
      where: { userId: userIds },
      attributes: ['userId', 'firstName', 'lastName', 'email']
    });
    
    if (users.length !== userIds.length) {
      const foundUserIds = users.map(u => u.userId);
      const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));
      return res.json({ 
        status: 'fail', 
        message: 'Some user IDs not found',
        missingUserIds 
      });
    }
    
    // Send notifications to all specified users
    const results = [];
    let totalSuccess = 0;
    let totalFailure = 0;
    
    for (const userId of userIds) {
      const user = users.find(u => u.userId === userId);
      
      const result = await sendPushNotificationToUser(userId, notification, {
        type: 'admin_test',
        url: data?.url || '/',
        adminSent: true,
        sentBy: adminUser.firstName + ' ' + adminUser.lastName,
        ...data
      });
      
      results.push({
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        success: result.success,
        devicesReached: result.response?.successCount || 0,
        devicesFailed: result.response?.failureCount || 0,
        error: result.error || null
      });
      
      if (result.success) {
        totalSuccess += result.response?.successCount || 0;
        totalFailure += result.response?.failureCount || 0;
      }
    }
    
    res.json({ 
      status: 'success', 
      message: `Admin test notification sent to ${userIds.length} users`,
      summary: {
        usersTargeted: userIds.length,
        totalDevicesReached: totalSuccess,
        totalDevicesFailed: totalFailure
      },
      results
    });
    
  } catch (error) {
    console.error('Error sending admin test push notification:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to send admin test push notification' });
  }
};
