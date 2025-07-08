const sendAdminNote = require("./adminNote");
const { sendVerificationEmail } = require("./emailVerification");
const { sendNotificationEmail } = require("./notificationEmail");
const { sendPasswordResetEmail } = require("./passwordReset");

module.exports = { sendAdminNote, sendVerificationEmail, sendNotificationEmail, sendPasswordResetEmail };