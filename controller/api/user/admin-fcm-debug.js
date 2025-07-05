const router = require('express').Router();
const { User, UserFcmToken } = require('../../../models');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
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
    
    const { userId } = req.query;
    
    if (!userId) {
      return res.json({ status: 'fail', message: 'User ID is required' });
    }
    
    // Get user info
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'firstName', 'lastName', 'email']
    });
    
    if (!user) {
      return res.json({ status: 'fail', message: 'User not found' });
    }
    
    // Get all FCM tokens for this user (both active and inactive)
    const allTokens = await UserFcmToken.findAll({
      where: { userId },
      attributes: ['fcmToken', 'deviceInfo', 'isActive']
    });
    
    const activeTokens = allTokens.filter(t => t.isActive);
    const inactiveTokens = allTokens.filter(t => !t.isActive);
    
    res.json({
      status: 'success',
      user: {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      tokens: {
        total: allTokens.length,
        active: activeTokens.length,
        inactive: inactiveTokens.length,
        details: allTokens.map(token => ({
          tokenPrefix: token.fcmToken.substring(0, 30) + '...',
          deviceInfo: token.deviceInfo,
          isActive: token.isActive
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching FCM debug info:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to fetch FCM debug info' });
  }
});

module.exports = router;
