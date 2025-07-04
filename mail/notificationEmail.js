const FormData = require("form-data");
const Mailgun = require("mailgun.js");
const { checkEmailPreference } = require("../helpers/emailUtils");

async function sendNotificationEmail(userId, subject, templateName, templateVariables, preferenceType = null) {
  console.log(`Checking email preferences for user ${userId}...`);
  
  // Check if user has opted in to this specific type of email
  const prefCheck = await checkEmailPreference(userId, preferenceType);
  
  if (!prefCheck.canSend) {
    console.log(`Email not sent: ${prefCheck.reason}`);
    return { success: false, reason: prefCheck.reason };
  }

  const mailgun = new Mailgun(FormData);
  console.log(`Sending notification email to: ${prefCheck.email}`);

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_KEY
  });

  try {
    const data = await mg.messages.create("mg.fantasy-survivor.net", {
      from: "Fantasy Survivor <noreply@fantasy-survivor.net>",
      to: [prefCheck.email],
      subject: subject,
      template: templateName,
      "h:X-Mailgun-Variables": JSON.stringify(templateVariables),
    });
    
    console.log("Notification email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending notification email:", error);
    return { success: false, error };
  }
}

module.exports = { sendNotificationEmail };
