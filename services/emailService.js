const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
  try {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Ethereal if no SMTP is configured
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: '"Hostel Management System" <noreply@hostel.edu>',
      to,
      subject,
      text,
      html
    });

    if (!process.env.SMTP_HOST) {
      console.log(`\n======================================================`);
      console.log(`[TEST EMAIL] Simulated sending email to: ${to}`);
      console.log(`[TEST EMAIL] Subject: ${subject}`);
      console.log(`[TEST EMAIL] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`======================================================\n`);
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };
