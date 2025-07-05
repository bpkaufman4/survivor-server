const { UserFcmToken } = require('../../../models');
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
    
    // Get all active FCM tokens for this user
    const devices = await UserFcmToken.findAll({
      where: { 
        userId,
        isActive: true 
      },
      attributes: ['id', 'deviceInfo', 'created', 'updated'],
      order: [['updated', 'DESC']]
    });
    
    // Format device information for display
    const formattedDevices = devices.map(device => {
      const info = device.deviceInfo || {};
      return {
        id: device.id,
        platform: info.platform || 'Unknown',
        browser: getBrowserName(info.userAgent),
        lastSeen: device.updated,
        registeredAt: device.created,
        screenResolution: info.screenResolution,
        timezone: info.timezone
      };
    });
    
    res.json({ 
      status: 'success', 
      data: {
        deviceCount: formattedDevices.length,
        devices: formattedDevices
      }
    });
    
  } catch (error) {
    console.error('Error fetching user devices:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to fetch devices' });
  }
};

// Helper function to extract browser name from user agent
function getBrowserName(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
}
