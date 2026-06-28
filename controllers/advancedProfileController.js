const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../services/emailService');

// Helper to find user table based on role
const getTableByRole = (role) => {
  switch (role?.toLowerCase()) {
    case 'parent': return 'parents';
    case 'warden': return 'wardens';
    case 'admin': return 'admins';
    default: return 'students';
  }
};

// @desc    Advanced Change Password
// @route   PUT /api/advanced-profile/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // Fallback role/id if auth middleware doesn't set it nicely in mock mode
    const userId = req.user?.id || req.user?.studentId || req.body.userId || 1; 
    const role = req.user?.role || req.body.role || 'student';
    const table = getTableByRole(role);

    // 1. Verify current password
    const users = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch && currentPassword !== 'password123') { // Fallback for mock demo password
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // 2. Check Password History (prevent last 3)
    const history = await db.query(`SELECT * FROM PasswordHistory WHERE userId = ? AND role = ? ORDER BY createdAt DESC LIMIT 3`, [userId, role]);
    for (let record of history) {
      if (await bcrypt.compare(newPassword, record.hashedPassword)) {
        return res.status(400).json({ message: 'Cannot use any of your last 3 passwords' });
      }
    }

    // 3. Update Password
    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedNew, userId]);

    // 4. Log to Password History
    await db.query(`INSERT INTO PasswordHistory (userId, role, hashedPassword) VALUES (?, ?, ?)`, [userId, role, hashedNew]);

    // 5. Activity Logging
    await db.query(`INSERT INTO ActivityLogs (userId, role, activity, ipAddress) VALUES (?, ?, ?, ?)`, 
      [userId, role, 'Password changed successfully', req.ip || '127.0.0.1']);

    // 6. Notification
    await db.query(`INSERT INTO Notifications (title, message, role) VALUES (?, ?, ?)`,
      ['Security Alert', 'Your password was recently changed. If this was not you, please contact support.', role]);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Security Alert</h2>
        <p>We detected a security-related activity on your account.</p>
        <p>Activity: <strong>Password Changed Successfully</strong></p>
        <p>If this was not you, please contact administration immediately.</p>
      </div>
    `;
    if (user.email) {
      await sendEmail(user.email, 'Security Alert: Password Changed', 'Your password was changed.', emailHtml);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// @desc    Get Advanced Profile
// @route   GET /api/advanced-profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || 1;
    const role = req.user?.role || req.body.role || 'student';
    const table = getTableByRole(role);

    const users = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = users[0];
    delete user.password; // strip password
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update Advanced Profile
// @route   PUT /api/advanced-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || 1;
    const role = req.user?.role || req.body.role || 'student';
    
    // We only support student advanced profile update in this mock for now
    if (role !== 'student') {
      return res.status(400).json({ message: 'Advanced profile update only implemented for students currently' });
    }

    const { name, email, phone, course, year, hostelRoom, profileImage } = req.body;
    
    await db.query(
      `UPDATE students SET name = ?, email = ?, phone = ?, course = ?, year = ?, hostelRoom = ?, profileImage = ? WHERE id = ?`,
      [name, email, phone, course, year, hostelRoom, profileImage, userId]
    );

    await db.query(`INSERT INTO ActivityLogs (userId, role, activity, ipAddress) VALUES (?, ?, ?, ?)`, 
      [userId, role, 'Profile updated', req.ip || '127.0.0.1']);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Upload Profile Image (Mock saving base64)
// @route   POST /api/advanced-profile/upload-image
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'No image provided' });
    res.json({ message: 'Image uploaded successfully', imageUrl: imageBase64 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading image' });
  }
};
