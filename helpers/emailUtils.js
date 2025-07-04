const { User } = require('../models');

async function checkEmailOptIn(userId) {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['emailOptIn', 'email']
    });
    
    if (!user) {
      return { canSend: false, reason: 'User not found' };
    }
    
    if (!user.email) {
      return { canSend: false, reason: 'No email address' };
    }
    
    if (user.emailOptIn === false) {
      return { canSend: false, reason: 'User has opted out of emails' };
    }
    
    return { canSend: true, email: user.email };
  } catch (error) {
    console.error('Error checking email opt-in:', error);
    return { canSend: false, reason: 'Error checking preferences' };
  }
}

async function checkEmailPreference(userId, preferenceType) {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['emailPreferences', 'email', 'emailVerified']
    });
    
    if (!user) {
      return { canSend: false, reason: 'User not found' };
    }
    
    if (!user.email) {
      return { canSend: false, reason: 'No email address' };
    }
    
    // If no specific preference type is provided, check if any preferences are enabled
    if (!preferenceType) {
      const prefs = user.emailPreferences || {};
      const hasAnyEnabled = prefs.draftNotifications || prefs.latestUpdates || prefs.pollReminders;
      if (!hasAnyEnabled) {
        return { canSend: false, reason: 'User has opted out of all email notifications' };
      }
      return { canSend: true, email: user.email };
    }
    
    // Check specific preference type
    const preferences = user.emailPreferences || {};
    const isEnabled = preferences[preferenceType] !== false; // Default to true for backwards compatibility
    
    if (!isEnabled) {
      return { canSend: false, reason: `User has opted out of ${preferenceType}` };
    }
    
    return { canSend: true, email: user.email };
  } catch (error) {
    console.error('Error checking email preference:', error);
    return { canSend: false, reason: 'Error checking preferences' };
  }
}

module.exports = { checkEmailOptIn, checkEmailPreference };
