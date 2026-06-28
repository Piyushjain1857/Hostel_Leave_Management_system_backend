const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendEmail } = require('../services/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getTableByRole = (role) => {
  switch (role) {
    case 'student': return 'students';
    case 'parent': return 'Parents';
    case 'warden': return 'Wardens';
    case 'admin': return 'Admins';
    default: return null;
  }
};

/**
 * @desc    Register a new user and send OTP
 * @route   POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { role = 'student', name, email, password, hostelRoom, phone, studentEmail, hostelAssigned, shift } = req.body;
    const table = getTableByRole(role);

    if (!table || !name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Check if user already exists anywhere in the system (limit 1 account per email across all roles)
    const [existingStudent, existingParent, existingWarden, existingAdmin] = await Promise.all([
      db.query(`SELECT id FROM students WHERE email = ?`, [email]),
      db.query(`SELECT id FROM Parents WHERE email = ?`, [email]),
      db.query(`SELECT id FROM Wardens WHERE email = ?`, [email]),
      db.query(`SELECT id FROM Admins WHERE email = ?`, [email])
    ]);

    if (
      existingStudent.length > 0 ||
      existingParent.length > 0 ||
      existingWarden.length > 0 ||
      existingAdmin.length > 0
    ) {
      return res.status(400).json({ message: 'Email already registered. Try logging in, or use another email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let insertQuery = '';
    let insertParams = [];

    let parentStudentId = null;
    if (role === 'parent') {
      if (!studentEmail) {
        return res.status(400).json({ message: 'Student email is required for parent registration.' });
      }
      const studentMatch = await db.query('SELECT id FROM students WHERE email = ?', [studentEmail]);
      if (studentMatch.length === 0) {
        return res.status(400).json({ message: 'No student found with that email address. Please ask your ward to register first.' });
      }
      parentStudentId = studentMatch[0].id;
    }

    if (role === 'student') {
      insertQuery = 'INSERT INTO students (name, email, password, hostelRoom, isVerified) VALUES (?, ?, ?, ?, ?)';
      insertParams = [name, email, hashedPassword, hostelRoom || '', false];
    } else if (role === 'parent') {
      insertQuery = 'INSERT INTO Parents (name, email, password, phone, studentId, isVerified) VALUES (?, ?, ?, ?, ?, ?)';
      insertParams = [name, email, hashedPassword, phone || '', parentStudentId, false];
    } else if (role === 'warden') {
      insertQuery = 'INSERT INTO Wardens (name, email, password, phone, hostelAssigned, shift, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)';
      insertParams = [name, email, hashedPassword, phone || '', hostelAssigned || '', shift || '', false];
    } else if (role === 'admin') {
      insertQuery = 'INSERT INTO Admins (name, email, password, isVerified) VALUES (?, ?, ?, ?)';
      insertParams = [name, email, hashedPassword, false];
    }

    const result = await db.query(insertQuery, insertParams);
    // Note: mock db returns { insertId }, mysql returns [ {insertId} ] or {insertId} depending on wrapper. 
    // We'll query back to get the id if insertId is missing.
    const newUsers = await db.query(`SELECT id FROM ${table} WHERE email = ?`, [email]);
    const userId = newUsers[0].id;

    // Generate and save OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    await db.query(
      'INSERT INTO EmailVerification (userId, role, email, otp, isVerified, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, role, email, otp, false, expiresAt]
    );

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Verify Your Account</h2>
        <p>Hello ${name},</p>
        <p>Welcome to Hostel Leave Management System.</p>
        <p>Your verification code is:</p>
        <h1 style="background: #f1f5f9; padding: 10px; display: inline-block; letter-spacing: 5px; color: #1e3a8a;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>Thank You.</p>
      </div>
    `;

    await sendEmail(email, 'Verify Your Account - HLMS', `Your OTP is ${otp}`, emailHtml);

    res.status(201).json({ message: 'Account created! Please verify your OTP sent to email.', email, role });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    const records = await db.query(
      'SELECT * FROM EmailVerification WHERE email = ? AND role = ? AND otp = ? ORDER BY id DESC LIMIT 1',
      [email, role, otp]
    );

    if (records.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    const verification = records[0];
    if (new Date() > new Date(verification.expiresAt)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (verification.isVerified) {
      return res.status(400).json({ message: 'Account is already verified.' });
    }

    const table = getTableByRole(role);
    await db.query(`UPDATE ${table} SET isVerified = ? WHERE id = ?`, [true, verification.userId]);
    await db.query('UPDATE EmailVerification SET isVerified = ? WHERE id = ?', [true, verification.id]);

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Internal server error during verification.' });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 */
const resendOTP = async (req, res) => {
  try {
    const { email, role } = req.body;
    const table = getTableByRole(role);

    const users = await db.query(`SELECT id, name FROM ${table} WHERE email = ?`, [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await db.query(
      'INSERT INTO EmailVerification (userId, role, email, otp, isVerified, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, role, email, otp, false, expiresAt]
    );

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">New Verification Code</h2>
        <p>Hello ${user.name},</p>
        <p>Your new verification code is:</p>
        <h1 style="background: #f1f5f9; padding: 10px; display: inline-block; letter-spacing: 5px; color: #1e3a8a;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail(email, 'Your New OTP - HLMS', `Your OTP is ${otp}`, emailHtml);

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * @desc    Forgot Password Request
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const table = getTableByRole(role);

    const users = await db.query(`SELECT id FROM ${table} WHERE email = ?`, [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await db.query(
      'INSERT INTO PasswordResetOTP (email, role, otp, expiresAt) VALUES (?, ?, ?, ?)',
      [email, role, otp, expiresAt]
    );

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>Your password reset OTP is:</p>
        <h1 style="background: #f1f5f9; padding: 10px; display: inline-block; letter-spacing: 5px; color: #1e3a8a;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail(email, 'Password Reset Request', `Your reset OTP is ${otp}`, emailHtml);

    res.json({ message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * @desc    Verify Reset OTP
 * @route   POST /api/auth/verify-reset-otp
 */
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    const records = await db.query(
      'SELECT * FROM PasswordResetOTP WHERE email = ? AND role = ? AND otp = ? ORDER BY id DESC LIMIT 1',
      [email, role, otp]
    );

    if (records.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > new Date(records[0].expiresAt)) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    res.json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Verify Reset OTP Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, role, newPassword, otp } = req.body;

    // Validate OTP again for security
    const records = await db.query(
      'SELECT * FROM PasswordResetOTP WHERE email = ? AND role = ? AND otp = ? ORDER BY id DESC LIMIT 1',
      [email, role, otp]
    );

    if (records.length === 0 || new Date() > new Date(records[0].expiresAt)) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const table = getTableByRole(role);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashedPassword, email]);

    // Cleanup OTPs for this email
    await db.query('DELETE FROM PasswordResetOTP WHERE email = ? AND role = ?', [email, role]);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Security Alert</h2>
        <p>We detected a security-related activity on your account.</p>
        <p>Activity: <strong>Password Changed Successfully</strong></p>
        <p>If this was not you, please contact administration immediately.</p>
      </div>
    `;

    await sendEmail(email, 'Security Alert: Password Changed', 'Your password was changed.', emailHtml);

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const sendLoginAlert = async (user, role, req) => {
  const loginTime = new Date().toLocaleString();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown Browser/Device';

  try {
    await db.query(
      'INSERT INTO LoginHistory (userId, role, loginTime, ipAddress, browser) VALUES (?, ?, NOW(), ?, ?)',
      [user.id, role, ip, userAgent]
    );
  } catch (err) {
    console.error('Error logging history:', err);
  }

  const loginHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e3a8a;">New Login Detected</h2>
      <p>Hello ${user.name},</p>
      <p>A new login was detected on your Hostel Leave Management System account.</p>
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Role:</strong> ${role}</p>
        <p style="margin: 0;"><strong>Date & Time:</strong> ${loginTime}</p>
        <p style="margin: 0;"><strong>Browser/Device:</strong> ${userAgent}</p>
        <p style="margin: 0;"><strong>IP Address:</strong> ${ip}</p>
      </div>
      <p>If this was you, no action is required.</p>
      <p>If this was not you, please change your password immediately.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>HLMS Security Team</strong></p>
    </div>
  `;

  await sendEmail(user.email, 'New Login Detected', `You have logged in on ${loginTime}`, loginHtml);
};

/**
 * @desc    Authenticate Student & Get Token
 * @route   POST /api/auth/login
 */
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password fields are required.' });
    }

    const students = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (students.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials. Please verify your email and password.' });
    }

    const student = students[0];

    // Check verification
    if (student.isVerified === 0 || student.isVerified === false) {
      // For mock compatibility, if it's undefined, we could treat it as verified, but strict check here.
      // Assuming seed ensures true for mock users.
      if (student.isVerified !== undefined) {
        return res.status(403).json({ message: 'Account not verified. Please verify your email first.', unverified: true });
      }
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Please verify your email and password.' });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    await sendLoginAlert(student, 'student', req);

    res.json({
      message: 'Authentication successful.',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        hostelRoom: student.hostelRoom,
        profileImage: student.profileImage || ''
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  loginStudent,
  sendLoginAlert // export for use in parent/warden/admin controllers
};
