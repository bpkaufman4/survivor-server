const FormData = require("form-data");
const Mailgun = require("mailgun.js");

async function sendPasswordResetEmail(email, firstName, resetToken) {
  const mailgun = new Mailgun(FormData);

  console.log("Sending password reset email to:", email);

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_KEY
  });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  try {
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "Fantasy Survivor <noreply@fantasy-survivor.net>",
      to: [email],
      subject: "Reset Your Password - Fantasy Survivor",
      template: "password-reset",
      'h:X-Mailgun-Variables': JSON.stringify({
        firstName: firstName,
        resetUrl: resetUrl
      })
    });
    console.log("Password reset email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}

module.exports = { sendPasswordResetEmail };
