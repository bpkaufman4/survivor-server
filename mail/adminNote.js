const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0

async function sendAdminNote() {
  const mailgun = new Mailgun(FormData);



  console.log("Sending admin note...");

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_KEY
  });

  try {
    const data = await mg.messages.create("mg.fantasy-survivor.net", {
      from: "Brian Kaufman <bpkaufman4@gmail.com>",
      to: ["Brian Kaufman <bpkaufman4@gmail.com>"],
      subject: "Hello Brian Kaufman",
      template: "AdminNote",
      "h:X-Mailgun-Variables": JSON.stringify({
        note: "This is a test message from the admin note function.",
        createdAt: "This is the created date of the adminnote"
      }),
    });
    console.log(data); // logs response data
    return data
  } catch (error) {
    console.log(error); // logs any error
    return error;
  }
}

module.exports = sendAdminNote;