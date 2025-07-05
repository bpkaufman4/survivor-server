const { User, UserFcmToken } = require('./models');
const { sendPushNotificationToUser } = require('./helpers/pushNotifications');

async function debugDuplicateNotifications() {
  try {
    console.log('=== Debugging Duplicate Notifications ===');
    
    // Find all users with FCM tokens
    const usersWithTokens = await UserFcmToken.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'user', // Use the correct alias
        attributes: ['userId', 'username', 'email']
      }],
      attributes: ['id', 'fcmToken', 'deviceInfo', 'created', 'updated']
    });
    
    console.log(`\nFound ${usersWithTokens.length} active FCM tokens:`);
    
    const userTokenCounts = {};
    usersWithTokens.forEach(token => {
      const userId = token.user.userId;
      const username = token.user.username;
      
      if (!userTokenCounts[userId]) {
        userTokenCounts[userId] = {
          username,
          tokens: []
        };
      }
      
      userTokenCounts[userId].tokens.push({
        id: token.id,
        fcmToken: token.fcmToken.substring(0, 20) + '...',
        deviceInfo: token.deviceInfo,
        created: token.created,
        updated: token.updated
      });
    });
    
    // Display token summary
    for (const [userId, data] of Object.entries(userTokenCounts)) {
      console.log(`\n👤 User: ${data.username} (ID: ${userId})`);
      console.log(`📱 Token count: ${data.tokens.length}`);
      
      data.tokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}:`);
        console.log(`    ID: ${token.id}`);
        console.log(`    FCM: ${token.fcmToken}`);
        console.log(`    Device: ${JSON.stringify(token.deviceInfo, null, 6)}`);
        console.log(`    Created: ${token.created}`);
        console.log(`    Updated: ${token.updated}`);
      });
      
      // Check for potential duplicates
      if (data.tokens.length > 1) {
        console.log(`⚠️  Multiple tokens found for user ${data.username}!`);
        
        // Check if any tokens are similar
        for (let i = 0; i < data.tokens.length; i++) {
          for (let j = i + 1; j < data.tokens.length; j++) {
            const token1 = data.tokens[i];
            const token2 = data.tokens[j];
            
            // Check if device info is similar
            const device1 = token1.deviceInfo || {};
            const device2 = token2.deviceInfo || {};
            
            if (device1.userAgent === device2.userAgent && 
                device1.platform === device2.platform) {
              console.log(`🔍 Tokens ${token1.id} and ${token2.id} have similar device info`);
            }
          }
        }
      }
    }
    
    // Ask which user to send test notification to
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\nAvailable users:');
    Object.entries(userTokenCounts).forEach(([userId, data]) => {
      console.log(`${userId}: ${data.username} (${data.tokens.length} tokens)`);
    });
    
    rl.question('\nEnter user ID to send debug notification to (or "all" for all users): ', async (answer) => {
      try {
        const now = new Date().toISOString();
        const timestamp = Date.now();
        
        if (answer.toLowerCase() === 'all') {
          console.log('Sending debug notification to all users...');
          
          for (const [userId, data] of Object.entries(userTokenCounts)) {
            const notification = {
              title: '🐛 Duplicate Debug Test',
              body: `Debug for ${data.username} - ${data.tokens.length} tokens - ${now}`
            };
            
            const debugData = {
              type: 'debug',
              url: '/settings',
              timestamp: timestamp.toString(),
              userTokenCount: data.tokens.length.toString(),
              debugTime: now
            };
            
            console.log(`\nSending to user ${data.username} (${data.tokens.length} tokens)...`);
            const result = await sendPushNotificationToUser(parseInt(userId), notification, debugData);
            console.log(`Result:`, result.success ? '✅ Success' : '❌ Failed', result.message || '');
          }
        } else {
          const userId = parseInt(answer);
          const userData = userTokenCounts[userId];
          
          if (!userData) {
            console.log('User not found!');
            rl.close();
            return;
          }
          
          const notification = {
            title: '🐛 Duplicate Debug Test',
            body: `Debug for ${userData.username} - ${userData.tokens.length} tokens - ${now}`
          };
          
          const debugData = {
            type: 'debug',
            url: '/settings',
            timestamp: timestamp.toString(),
            userTokenCount: userData.tokens.length.toString(),
            debugTime: now
          };
          
          console.log(`\nSending debug notification to ${userData.username}...`);
          const result = await sendPushNotificationToUser(userId, notification, debugData);
          console.log('Result:', result);
        }
        
        rl.close();
      } catch (error) {
        console.error('Error sending debug notification:', error);
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('Error in debug script:', error);
  }
}

// Run the debug script
debugDuplicateNotifications();
