require('dotenv').config();
const nodemailer = require('nodemailer');

const test = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('Sending test email to', process.env.SMTP_USER, '...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Test Email Notification',
      text: 'This is a test email to verify credentials.',
    });

    console.log('Email sent successfully!', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

test();
