const nodemailer = require('nodemailer');
require('dotenv').config();

const emailService = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS,
  },
});

module.exports = emailService;
