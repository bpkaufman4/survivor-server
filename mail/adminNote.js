const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0
const { User } = require("../models");

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
      attributes: ['email', 'firstName', 'lastName', 'emailPreferences']
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

    // Send email to each eligible user
    for (const user of usersToEmail) {
      try {
        const data = await mg.messages.create("mg.fantasy-survivor.net", {
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
        
        console.log(`Email sent to user ${user.firstName} ${user.lastName}`);
        results.push({ email: user.email, success: true, data });
      } catch (error) {
        console.error(`Failed to send email to user ${user.firstName} ${user.lastName}:`, error);
        results.push({ email: user.email, success: false, error });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Admin note email summary: ${successCount} sent, ${failureCount} failed`);
    
    return {
      success: true,
      summary: {
        totalEligible: usersToEmail.length,
        sent: successCount,
        failed: failureCount
      },
      results
    };

  } catch (error) {
    console.error("Error sending admin note emails:", error);
    return { success: false, error };
  }
}

module.exports = sendAdminNote;