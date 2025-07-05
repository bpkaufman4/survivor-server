#!/usr/bin/env node

/**
 * Debug script for testing push notifications directly
 * Usage: node debug-push-notifications.js [userId]
 */

require('dotenv').config();
const { sendPushNotificationToUser } = require('./helpers/pushNotifications');
const { User, UserFcmToken } = require('./models');

async function debugPushNotifications(userId) {
  try {
    console.log(`\n🚀 DEBUG PUSH NOTIFICATIONS`);
    console.log(`============================================`);
    console.log(`Target User ID: ${userId || 'NOT SPECIFIED'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Environment check
    console.log(`\n📋 ENVIRONMENT CHECK:`);
    console.log(`- FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`- FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`- FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '✅ SET' : '❌ NOT SET'}`);
    
    if (!userId) {
      console.log(`\n👥 AVAILABLE USERS WITH FCM TOKENS:`);
      const usersWithTokens = await User.findAll({
        include: [{
          model: UserFcmToken,
          where: { isActive: true },
          required: true
        }],
        attributes: ['userId', 'firstName', 'lastName', 'email']
      });
      
      if (usersWithTokens.length === 0) {
        console.log(`❌ No users found with active FCM tokens`);
        
        // Check if there are any tokens at all
        const allTokens = await UserFcmToken.findAll({
          attributes: ['userId', 'isActive', 'deviceInfo'],
          include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          }]
        });
        
        console.log(`\n📊 ALL FCM TOKENS IN DATABASE (${allTokens.length} total):`);
        allTokens.forEach((token, index) => {
          console.log(`  ${index + 1}. User ${token.userId} (${token.User?.firstName} ${token.User?.lastName})`);
          console.log(`     - Active: ${token.isActive}`);
          console.log(`     - Device: ${JSON.stringify(token.deviceInfo)}`);
        });
      } else {
        usersWithTokens.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (ID: ${user.userId})`);
          console.log(`     - Email: ${user.email}`);
          console.log(`     - Active tokens: ${user.UserFcmTokens?.length || 0}`);
        });
        
        console.log(`\n💡 To test a specific user, run:`);
        console.log(`   node debug-push-notifications.js <userId>`);
      }
      return;
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`❌ User with ID ${userId} not found`);
      return;
    }
    
    console.log(`\n👤 TARGET USER:`);
    console.log(`- Name: ${user.firstName} ${user.lastName}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- User Type: ${user.userType}`);
    
    // Check user's FCM tokens
    console.log(`\n📱 USER'S FCM TOKENS:`);
    const allUserTokens = await UserFcmToken.findAll({
      where: { userId },
      attributes: ['fcmToken', 'isActive', 'deviceInfo']
    });
    
    if (allUserTokens.length === 0) {
      console.log(`❌ No FCM tokens found for this user`);
      console.log(`\n💡 The user needs to:`);
      console.log(`   1. Visit the app in a browser`);
      console.log(`   2. Go to Settings`);
      console.log(`   3. Enable push notifications`);
      return;
    }
    
    allUserTokens.forEach((token, index) => {
      console.log(`  ${index + 1}. Token: ${token.fcmToken.substring(0, 30)}...`);
      console.log(`     - Active: ${token.isActive ? '✅' : '❌'}`);
      console.log(`     - Device: ${JSON.stringify(token.deviceInfo)}`);
    });
    
    const activeTokens = allUserTokens.filter(t => t.isActive);
    if (activeTokens.length === 0) {
      console.log(`\n❌ No ACTIVE FCM tokens found for this user`);
      console.log(`All tokens have been marked as inactive (possibly due to previous failures)`);
      return;
    }
    
    // Send test notification
    console.log(`\n🔔 SENDING TEST NOTIFICATION:`);
    const testNotification = {
      title: '🧪 Debug Test Notification',
      body: `This is a debug test sent at ${new Date().toLocaleTimeString()}`
    };
    
    const testData = {
      type: 'debug_test',
      url: '/',
      debugMode: true,
      sentAt: new Date().toISOString()
    };
    
    console.log(`- Title: ${testNotification.title}`);
    console.log(`- Body: ${testNotification.body}`);
    console.log(`- Data:`, testData);
    
    const result = await sendPushNotificationToUser(userId, testNotification, testData);
    
    console.log(`\n📊 FINAL RESULT:`);
    console.log(`- Success: ${result.success ? '✅' : '❌'}`);
    console.log(`- Message: ${result.message || 'N/A'}`);
    console.log(`- Devices reached: ${result.response?.successCount || 0}`);
    console.log(`- Devices failed: ${result.response?.failureCount || 0}`);
    
    if (result.error) {
      console.log(`- Error: ${result.error}`);
    }
    
    if (result.response?.responses) {
      console.log(`\n📱 PER-DEVICE RESULTS:`);
      result.response.responses.forEach((resp, index) => {
        if (resp.success) {
          console.log(`  Device ${index + 1}: ✅ SUCCESS (messageId: ${resp.messageId})`);
        } else {
          console.log(`  Device ${index + 1}: ❌ FAILED (${resp.error?.code}: ${resp.error?.message})`);
        }
      });
    }
    
    console.log(`\n============================================`);
    console.log(`🎯 Debug complete!`);
    
  } catch (error) {
    console.error(`\n💥 DEBUGGING ERROR:`, error);
    console.error(`Stack trace:`, error.stack);
  }
}

// Get userId from command line argument
const userId = process.argv[2];

// Connect to database and run debug
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => {
    console.log('📡 Database connection established');
    return debugPushNotifications(userId);
  })
  .then(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Database connection error:', error);
    process.exit(1);
  });
