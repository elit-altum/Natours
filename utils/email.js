// Utils file to send emails via nodemailer
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create transporter for sending emails
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Declare message settings
  const messageOptions = {
    from: 'customer@natours.io',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Send the email
  await transporter.sendMail(messageOptions);
};

module.exports = sendEmail;
