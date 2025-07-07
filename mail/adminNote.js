const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0
const { User } = require("../models");
const { sendAdminNoteNotification } = require("../helpers/pushNotifications");

async function sendAdminNote(noteContent, createdAt) {
  console.log("Sending admin note to users with latest updates enabled...");

  try {
    // Get all users who have latest updates email preference enabled
    const eligibleUsers = await User.findAll({
      where: {
        email: {
          [require('sequelize').Op.not]: null
        },
        emailVerified: true
      },
      attributes: ['userId', 'email', 'firstName', 'lastName', 'emailPreferences']
    });

    // Filter users who have latestUpdates enabled (default to true for backwards compatibility)
    const usersToEmail = eligibleUsers.filter(user => {
      const prefs = user.emailPreferences || {};
      return prefs.latestUpdates !== false;
    });

    console.log(`Found ${usersToEmail.length} users eligible for latest updates emails`);

    if (usersToEmail.length === 0) {
      console.log("No users to email - all have opted out of latest updates");
      return { success: true, message: "No eligible users found" };
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_KEY
    });

    const results = [];

    // Send both email and push notification to each eligible user
    for (const user of usersToEmail) {
      const userResult = { userId: user.userId, email: user.email, emailSent: false, pushSent: false };
      
      try {
        // Send email
        const emailData = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
          from: "Fantasy Survivor <noreply@fantasy-survivor.net>",
          to: [user.email],
          subject: "New Update from Fantasy Survivor",
          template: "AdminNote",
          "h:X-Mailgun-Variables": JSON.stringify({
            note: noteContent || "A new update has been posted.",
            createdAt: createdAt || new Date().toLocaleDateString(),
            firstName: user.firstName,
            lastName: user.lastName
          }),
        });
        
        userResult.emailSent = true;
        userResult.emailData = emailData;
        console.log(`Email sent to user ${user.firstName} ${user.lastName}`);
      } catch (error) {
        console.error(`Failed to send email to user ${user.firstName} ${user.lastName}:`, error);
        userResult.emailError = error;
      }

      try {
        // Send push notification with truncated message
        const pushResult = await sendAdminNoteNotification(user.userId, {
          message: noteContent || "A new update has been posted.",
          id: Date.now() // Use timestamp as a simple ID
        });
        
        userResult.pushSent = pushResult.success;
        if (pushResult.success) {
          console.log(`Push notification sent to user ${user.firstName} ${user.lastName}`);
        } else {
          console.log(`Push notification failed for user ${user.firstName} ${user.lastName}: ${pushResult.message || 'Unknown error'}`);
        }
        userResult.pushData = pushResult;
      } catch (error) {
        console.error(`Failed to send push notification to user ${user.firstName} ${user.lastName}:`, error);
        userResult.pushError = error;
      }

      results.push(userResult);
    }

    const emailSuccessCount = results.filter(r => r.emailSent).length;
    const emailFailureCount = results.filter(r => !r.emailSent).length;
    const pushSuccessCount = results.filter(r => r.pushSent).length;
    const pushFailureCount = results.filter(r => !r.pushSent).length;

    console.log(`Admin note summary: 
      Emails - ${emailSuccessCount} sent, ${emailFailureCount} failed
      Push notifications - ${pushSuccessCount} sent, ${pushFailureCount} failed`);
    
    return {
      success: true,
      summary: {
        totalEligible: usersToEmail.length,
        emails: {
          sent: emailSuccessCount,
          failed: emailFailureCount
        },
        pushNotifications: {
          sent: pushSuccessCount,
          failed: pushFailureCount
        }
      },
      results
    };

  } catch (error) {
    console.error("Error sending admin note emails:", error);
    return { success: false, error };
  }
}

module.exports = sendAdminNote;