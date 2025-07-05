const { User, UserFcmToken } = require('../../../models');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    const { fcmToken, deviceInfo = {} } = req.body;
    
    if (!fcmToken) {
      return res.json({ status: 'fail', message: 'FCM token is required' });
    }
    
    // Get user ID from JWT token
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    // Check if this FCM token already exists for this user
    const existingToken = await UserFcmToken.findOne({
      where: { fcmToken, userId }
    });
    
    if (existingToken) {
      // Update the existing token's device info and mark as active
      await existingToken.update({
        deviceInfo,
        isActive: true,
        updated: new Date()
      });
      
      return res.json({ 
        status: 'success', 
        message: 'FCM token updated successfully',
        tokenId: existingToken.id
      });
    }
    
    // Check if this FCM token exists for a different user (shouldn't happen, but clean up if it does)
    const tokenFromOtherUser = await UserFcmToken.findOne({
      where: { fcmToken }
    });
    
    if (tokenFromOtherUser) {
      // Deactivate the old token - user probably switched accounts
      await tokenFromOtherUser.update({ isActive: false });
    }
    
    // Create new FCM token record
    const newToken = await UserFcmToken.create({
      userId,
      fcmToken,
      deviceInfo,
      isActive: true
    });
    
    res.json({ 
      status: 'success', 
      message: 'FCM token registered successfully',
      tokenId: newToken.id
    });
    
  } catch (error) {
    console.error('Error updating FCM token:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to update FCM token' });
  }
};
