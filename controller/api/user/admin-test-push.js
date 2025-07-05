const router = require('express').Router();
const { sendPushNotificationToUser } = require('../../../helpers/pushNotifications');
const { User } = require('../../../models');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  try {
    // Get user ID from JWT token and verify admin status
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findByPk(decoded.id);
    
    if (!adminUser || decoded.userType !== 'ADMIN') {
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
        testId: `admin_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data
      });
      
      // Determine specific error message
      let errorMessage = null;
      if (!result.success) {
        if (result.message === 'No active devices found for user') {
          errorMessage = 'User has no registered devices';
        } else {
          errorMessage = result.error || 'Unknown error occurred';
        }
      } else if (result.response?.failureCount > 0 && result.response?.successCount === 0) {
        errorMessage = 'All user devices failed to receive notification (invalid/expired tokens)';
      }
      
      results.push({
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        success: result.success && (result.response?.successCount || 0) > 0,
        devicesReached: result.response?.successCount || 0,
        devicesFailed: result.response?.failureCount || 0,
        error: errorMessage
      });
      
      if (result.success && (result.response?.successCount || 0) > 0) {
        totalSuccess += result.response?.successCount || 0;
      }
      if (result.response?.failureCount > 0) {
        totalFailure += result.response?.failureCount || 0;
      }
    }
    
    // Determine overall success message
    const successfulUsers = results.filter(r => r.success).length;
    const failedUsers = results.filter(r => !r.success).length;
    
    let message;
    if (successfulUsers === userIds.length) {
      message = `✅ Admin test notification sent successfully to all ${userIds.length} users`;
    } else if (successfulUsers > 0) {
      message = `⚠️ Admin test notification sent to ${successfulUsers}/${userIds.length} users (${failedUsers} failed)`;
    } else {
      message = `❌ Admin test notification failed for all ${userIds.length} users`;
    }
    
    res.json({ 
      status: totalSuccess > 0 ? 'success' : 'partial_fail',
      message,
      summary: {
        usersTargeted: userIds.length,
        usersSuccessful: successfulUsers,
        usersFailed: failedUsers,
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
});

module.exports = router;
