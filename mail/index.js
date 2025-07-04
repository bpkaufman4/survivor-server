const sendAdminNote = require("./adminNote");
const { sendVerificationEmail } = require("./emailVerification");
const { sendNotificationEmail } = require("./notificationEmail");

module.exports = { sendAdminNote, sendVerificationEmail, sendNotificationEmail };