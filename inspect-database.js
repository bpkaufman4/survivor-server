#!/usr/bin/env node

/**
 * Inspect database state for FCM tokens and users
 */

require('dotenv').config();
const { User, UserFcmToken } = require('./models');

async function inspectDatabase() {
  console.log(`\n🔍 DATABASE INSPECTION`);
  console.log(`======================`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Check total users
    const totalUsers = await User.count();
    console.log(`\n👥 USERS:`);
    console.log(`- Total users: ${totalUsers}`);
    
    // Check total FCM tokens
    const totalTokens = await UserFcmToken.count();
    const activeTokens = await UserFcmToken.count({ where: { isActive: true } });
    const inactiveTokens = totalTokens - activeTokens;
    
    console.log(`\n📱 FCM TOKENS:`);
    console.log(`- Total tokens: ${totalTokens}`);
    console.log(`- Active tokens: ${activeTokens}`);
    console.log(`- Inactive tokens: ${inactiveTokens}`);
    
    if (totalTokens === 0) {
      console.log(`\n❌ NO FCM TOKENS FOUND!`);
      console.log(`This means no users have registered for push notifications.`);
      console.log(`\nTo fix this:`);
      console.log(`1. Have a user visit the app`);
      console.log(`2. Go to Settings page`);
      console.log(`3. Enable push notifications`);
      console.log(`4. Check browser console for any errors`);
      return;
    }
    
    // Show users with tokens
    console.log(`\n👤 USERS WITH FCM TOKENS:`);
    const usersWithTokens = await User.findAll({
      include: [{
        model: UserFcmToken,
        required: false
      }],
      attributes: ['userId', 'firstName', 'lastName', 'email', 'userType']
    });
    
    usersWithTokens.forEach(user => {
      const userTokens = user.UserFcmTokens || [];
      const activeUserTokens = userTokens.filter(t => t.isActive);
      
      if (userTokens.length > 0) {
        console.log(`\n  ${user.firstName} ${user.lastName} (ID: ${user.userId})`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Type: ${user.userType}`);
        console.log(`  - Total tokens: ${userTokens.length}`);
        console.log(`  - Active tokens: ${activeUserTokens.length}`);
        
        userTokens.forEach((token, index) => {
          console.log(`    Token ${index + 1}:`);
          console.log(`      - FCM Token: ${token.fcmToken.substring(0, 30)}...`);
          console.log(`      - Active: ${token.isActive ? '✅' : '❌'}`);
          console.log(`      - Device: ${JSON.stringify(token.deviceInfo)}`);
        });
      }
    });
    
    // Show recent token activity
    console.log(`\n📅 RECENT TOKEN ACTIVITY:`);
    const recentTokens = await UserFcmToken.findAll({
      include: [{
        model: User,
        attributes: ['firstName', 'lastName']
      }],
      limit: 10
    });
    
    if (recentTokens.length === 0) {
      console.log(`No token activity found`);
    } else {
      recentTokens.forEach((token, index) => {
        console.log(`  ${index + 1}. ${token.User?.firstName} ${token.User?.lastName}`);
        console.log(`     - Token: ${token.fcmToken.substring(0, 30)}...`);
        console.log(`     - Active: ${token.isActive ? '✅' : '❌'}`);
        console.log(`     - Device: ${JSON.stringify(token.deviceInfo)}`);
      });
    }
    
    // Show summary for admin interface
    const usersWithActiveTokens = await User.findAll({
      include: [{
        model: UserFcmToken,
        where: { isActive: true },
        required: true
      }],
      attributes: ['userId', 'firstName', 'lastName', 'email']
    });
    
    console.log(`\n🎯 SUMMARY FOR ADMIN INTERFACE:`);
    console.log(`- Users available for testing: ${usersWithActiveTokens.length}`);
    
    if (usersWithActiveTokens.length > 0) {
      console.log(`\nUsers you can test push notifications with:`);
      usersWithActiveTokens.forEach((user, index) => {
        const tokenCount = user.UserFcmTokens?.length || 0;
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (ID: ${user.userId}) - ${tokenCount} device(s)`);
      });
      
      console.log(`\n💡 To test notifications:`);
      console.log(`1. Use the Admin interface at: [your-app-url]/admin`);
      console.log(`2. Go to "Push Notifications" section`);
      console.log(`3. Select one of the users listed above`);
      console.log(`4. Send a test notification`);
      
      console.log(`\n🛠️ To debug individual users:`);
      console.log(`   node debug-push-notifications.js <userId>`);
      console.log(`\n🔥 To test Firebase Admin setup:`);
      console.log(`   node test-firebase-admin.js`);
    } else {
      console.log(`\n❌ No users are currently available for push notification testing.`);
      console.log(`All users either have no FCM tokens or all their tokens are inactive.`);
    }
    
  } catch (error) {
    console.error(`💥 Database inspection error:`, error);
  }
}

// Connect to database and run inspection
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => {
    console.log('📡 Database connection established');
    return inspectDatabase();
  })
  .then(() => {
    console.log(`\n======================`);
    console.log(`🔍 Inspection complete!`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Database connection error:', error);
    process.exit(1);
  });
