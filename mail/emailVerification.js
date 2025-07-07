const FormData = require("form-data");
const Mailgun = require("mailgun.js");

async function sendVerificationEmail(email, firstName, verificationCode) {
  const mailgun = new Mailgun(FormData);

  console.log("Sending verification email to:", email);
  // Note: Verification emails are always sent regardless of email preferences
  // as they are critical for account security

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_KEY
  });

  try {
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "Fantasy Survivor <noreply@fantasy-survivor.net>",
      to: [email],
      subject: "Verify Your Email - Fantasy Survivor",
      template: "emailverification",
      "h:X-Mailgun-Variables": JSON.stringify({
        firstName: firstName,
        verificationCode: verificationCode.toString()
      }),
    });
    console.log("Verification email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}

module.exports = { sendVerificationEmail };
