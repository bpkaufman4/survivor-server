const admin = require('firebase-admin');
const { UserFcmToken } = require('../models');

// Initialize Firebase Admin SDK using environment variables
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL?.replace('@', '%40')}`,
      universe_domain: "googleapis.com"
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

/**
 * Convert all values in an object to strings (Firebase requirement)
 */
const convertDataToStrings = (data) => {
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      stringData[key] = String(value);
    }
  }
  return stringData;
};

/**
 * Map notification types to preference keys
 */
const getPrefKeyForNotificationType = (notificationType) => {
  switch (notificationType) {
    case 'draft':
    case 'draft_starting_soon':
      return 'draftNotifications';
    case 'admin_note':
      return 'latestUpdates';
    case 'survey':
      return 'pollReminders';
    default:
      return null;
  }
};



/**
 * Send push notifications to multiple users
 * @param {Array} tokens - Array of FCM tokens
 * @param {Object} notification - Notification data
 * @param {Object} data - Additional data to send with the notification
 * @param {Array} deviceInfos - Array of device info objects (optional)
 */
const sendPushNotificationToMultiple = async (tokens, notification, data = {}, deviceInfos = []) => {
  try {
    if (!admin.apps.length) {
      console.log('Firebase Admin not initialized, skipping push notifications');
      return { success: false, error: 'Firebase Admin not initialized' };
    }

    if (tokens.length === 0) {
      return { success: true, response: { successCount: 0, failureCount: 0, responses: [] } };
    }

    // Generate a single server notification ID for deduplication across all devices
    const timestamp = Date.now();
    const serverNotificationId = `${data.type || 'general'}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    // Create messages for each token - iOS devices get data-only messages to prevent auto-display
    const messages = tokens.map((token, index) => {
      // Check if this token belongs to an iOS device
      const deviceInfo = deviceInfos[index] || {};
      const isIOS = deviceInfo.isIOS === true;
      
      // Convert all data values to strings (Firebase requirement)
      const stringData = convertDataToStrings({
        ...data,
        clickAction: data.url || '/',
        type: data.type || 'general',
        timestamp: timestamp.toString(),
        notificationId: serverNotificationId,  // Same ID for all devices for deduplication
        serverNotificationId: serverNotificationId,  // Shared ID for deduplication
        // For iOS data-only messages, include notification content in data
        notificationTitle: notification.title,
        notificationBody: notification.body
      });
      
      if (isIOS) {
        // iOS: Send data-only message to prevent automatic notification display
        return {
          token: token,
          // NO notification payload for iOS - prevents auto-display
          data: stringData,
          apns: {
            payload: {
              aps: {
                'content-available': 1  // Silent push for iOS
              }
            }
          }
        };
      } else {
        // Non-iOS: Send normal notification + data message
        return {
          token: token,
          notification: {
            title: notification.title,
            body: notification.body
          },
          data: stringData,
          webpush: {
            headers: {
              Urgency: 'normal'
            },
            notification: {
              title: notification.title,
              body: notification.body,
              icon: notification.icon || '/android/android-launchericon-192-192.png',
              badge: '/android/android-launchericon-96-96.png',
              tag: serverNotificationId,  // Same tag for all devices - browser will deduplicate
              requireInteraction: data.requireInteraction || false
            }
          }
        };
      }
    });

    // Use sendEach for better error handling
    const response = await admin.messaging().sendEach(messages);
    
    return { success: true, response, serverNotificationId };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { success: false, error };
  }
};

/**
 * Send push notification to all active devices for a user
 * @param {string} userId - The user ID
 * @param {Object} notification - Notification data
 * @param {Object} data - Additional data to send with the notification
 * @param {string} notificationType - Type of notification to check preferences for
 */
const sendPushNotificationToUser = async (userId, notification, data = {}, notificationType = null) => {
  try {
    // If notification type is specified, check user preferences
    if (notificationType) {
      const { User } = require('../models');
      const user = await User.findByPk(userId, {
        attributes: ['pushNotificationPreferences']
      });
      
      if (user && user.pushNotificationPreferences) {
        const prefs = user.pushNotificationPreferences;
        const prefKey = getPrefKeyForNotificationType(notificationType);
        
        if (prefKey && prefs[prefKey] === false) {
          console.log(`📵 Push notification skipped for user ${userId} - ${notificationType} notifications disabled`);
          return { success: false, message: `User has disabled ${notificationType} push notifications` };
        }
      }
    }

    // Get all active FCM tokens for this user
    const fcmTokens = await UserFcmToken.findAll({
      where: { 
        userId,
        isActive: true 
      },
      attributes: ['fcmToken', 'deviceInfo']
    });
    
    if (fcmTokens.length === 0) {
      return { success: false, message: 'No active devices found for user' };
    }
    
    console.log(`📤 Sending push notification to user ${userId}:`);
    console.log(`📱 Found ${fcmTokens.length} active devices:`);
    
    fcmTokens.forEach((token, index) => {
      const deviceInfo = token.deviceInfo || {};
      console.log(`  Device ${index + 1}: ${token.fcmToken.substring(0, 20)}... (Platform: ${deviceInfo.platform || 'Unknown'}, iOS: ${deviceInfo.isIOS || false}, PWA: ${deviceInfo.isPWA || false})`);
    });
    
    const tokens = fcmTokens.map(token => token.fcmToken);
    const result = await sendPushNotificationToMultiple(tokens, notification, data);
    
    // Log detailed results for each device
    if (result.success && result.response) {
      console.log(`📊 Notification Results:`);
      console.log(`  ✅ Success: ${result.response.successCount}`);
      console.log(`  ❌ Failed: ${result.response.failureCount}`);
      
      if (result.response.responses) {
        result.response.responses.forEach((resp, index) => {
          const deviceInfo = fcmTokens[index].deviceInfo || {};
          const deviceDesc = `${deviceInfo.platform || 'Unknown'} (iOS: ${deviceInfo.isIOS || false}, PWA: ${deviceInfo.isPWA || false})`;
          
          if (resp.success) {
            console.log(`  ✅ Device ${index + 1} (${deviceDesc}): SUCCESS - ${resp.messageId}`);
          } else {
            console.log(`  ❌ Device ${index + 1} (${deviceDesc}): FAILED - ${resp.error?.code || 'Unknown error'}`);
            console.log(`    Error details:`, resp.error);
          }
        });
      }
    }
    
    // Handle failed tokens (invalid/expired)
    if (result.success && result.response?.failureCount > 0) {
      await handleFailedTokens(result.response, fcmTokens);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return { success: false, error };
  }
};

/**
 * Handle failed FCM tokens by deactivating them
 */
const handleFailedTokens = async (response, fcmTokens) => {
  try {
    const failedTokens = [];
    
    response.responses.forEach((resp, index) => {
      if (!resp.success) {
        const error = resp.error;
        const errorCode = error?.code || error?.errorInfo?.code;
        
        // Deactivate tokens that are invalid or unregistered
        if (errorCode === 'messaging/invalid-argument' || 
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token') {
          failedTokens.push(fcmTokens[index].fcmToken);
        }
      }
    });
    
    if (failedTokens.length > 0) {
      await UserFcmToken.update(
        { isActive: false },
        { where: { fcmToken: failedTokens } }
      );
      console.log(`Deactivated ${failedTokens.length} invalid FCM tokens`);
    }
  } catch (error) {
    console.error('Error handling failed tokens:', error);
  }
};

/**
 * Send push notification for draft events to all user devices
 */
const sendDraftNotification = async (userId, draftData) => {
  const notification = {
    title: 'Draft Update',
    body: `It's your turn to pick in ${draftData.leagueName}!`
  };
  
  const data = {
    type: 'draft',
    url: `/draft/${draftData.leagueId}`,
    leagueId: draftData.leagueId,
    requireInteraction: true
  };
  
  return await sendPushNotificationToUser(userId, notification, data, 'draft');
};

/**
 * Send push notification for admin notes to all user devices
 */
const sendAdminNoteNotification = async (userId, noteData) => {
  const notification = {
    title: 'New Admin Note',
    body: noteData.message.substring(0, 100) + (noteData.message.length > 100 ? '...' : '')
  };
  
  const data = {
    type: 'admin_note',
    url: '/notes',
    noteId: noteData.id
  };
  
  return await sendPushNotificationToUser(userId, notification, data, 'admin_note');
};



/**
 * Send survey reminder notification to all user devices
 */
const sendSurveyReminderNotificationToUser = async (userId, surveyData) => {
  const episodeName = surveyData.episodeName || 'upcoming episode';
  const teamCount = surveyData.teamCount || 1;
  const teamText = surveyData.teamText || 'team';
  const leagueId = surveyData.leagueId;
  
  const notification = {
    title: 'Survey Reminder',
    body: teamCount > 1 
      ? `Don't forget to complete your survey for ${episodeName}! You have ${teamCount} ${teamText} to update.`
      : `Don't forget to complete your survey for ${episodeName}!`
  };
  
  // If we have a leagueId, link to the specific league page, otherwise default to surveys
  const url = leagueId ? `/league/${leagueId}` : '/';
  
  const data = {
    type: 'survey',
    url: url,
    episodeId: surveyData.episodeId || '',
    teamCount: teamCount.toString(),
    leagueId: leagueId || ''
  };
  
  return await sendPushNotificationToUser(userId, notification, data, 'survey');
};


/**
 * Send draft starting soon notification to all user devices for league
 */
const sendDraftStartingSoonNotification = async (userId, leagueId) => {
  const notification = {
    title: 'Draft Starting Soon',
    body: `Your draft is starting soon!`
  };

  const data = {
    type: 'draft_starting_soon',
    url: `/draft/${leagueId}`,
    leagueId: leagueId
  };

  return await sendPushNotificationToUser(userId, notification, data, 'draft_starting_soon');
};

module.exports = {
  sendPushNotificationToMultiple,
  sendDraftStartingSoonNotification,
  sendPushNotificationToUser,
  sendDraftNotification,
  sendAdminNoteNotification,
  sendSurveyReminderNotificationToUser
};
