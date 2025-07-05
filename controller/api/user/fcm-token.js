const { User, UserFcmToken } = require('../../../models');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    console.log('\n=== FCM Token Registration ===');
    console.log('Request body:', req.body);
    console.log('Request headers authorization:', req.headers.authorization ? 'Present' : 'Missing');
    
    const { fcmToken, deviceInfo = {} } = req.body;
    
    if (!fcmToken) {
      console.log('❌ No FCM token provided');
      return res.json({ status: 'fail', message: 'FCM token is required' });
    }
    
    console.log('✅ FCM token received:', fcmToken.substring(0, 20) + '...');
    console.log('📱 Device info:', deviceInfo);
    
    // Get user ID from JWT token
    const token = req.headers.authorization;
    if (!token) {
      console.log('❌ No authorization token provided');
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log('👤 User ID:', userId);
    
    // Check if this FCM token already exists for this user
    const existingToken = await UserFcmToken.findOne({
      where: { fcmToken, userId }
    });
    
    if (existingToken) {
      console.log('🔄 Updating existing token for user');
      // Update the existing token's device info and mark as active
      await existingToken.update({
        deviceInfo,
        isActive: true,
        updated: new Date()
      });
      
      console.log('✅ FCM token updated successfully');
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
      console.log('🔄 Deactivating token from other user');
      // Deactivate the old token - user probably switched accounts
      await tokenFromOtherUser.update({ isActive: false });
    }
    
    // Create new FCM token record
    console.log('➕ Creating new FCM token record');
    const newToken = await UserFcmToken.create({
      userId,
      fcmToken,
      deviceInfo,
      isActive: true
    });

    console.log('✅ FCM token registered successfully');
    console.log('=== End FCM Token Registration ===\n');
    
    res.json({ 
      status: 'success', 
      message: 'FCM token registered successfully',
      tokenId: newToken.id
    });
    
  } catch (error) {
    console.error('💥 Error updating FCM token:', error);
    console.log('=== End FCM Token Registration (ERROR) ===\n');
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to update FCM token' });
  }
};
