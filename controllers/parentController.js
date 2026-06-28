const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendLoginAlert } = require('./authController');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Authenticate Parent & Get Token
 * @route   POST /parent/login
 * @access  Public
 */
const loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password fields are required.' });
    }

    const parents = await db.query('SELECT * FROM Parents WHERE email = ?', [email]);
    if (parents.length === 0) {
      return res.status(400).json({ message: 'Invalid parent credentials.' });
    }

    const parent = parents[0];
    
    if (parent.isVerified === 0 || parent.isVerified === false) {
      if (parent.isVerified !== undefined) {
          return res.status(403).json({ message: 'Account not verified. Please verify your email first.', unverified: true });
      }
    }

    const isMatch = await bcrypt.compare(password, parent.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid parent credentials.' });
    }

    const token = jwt.sign(
      { id: parent.id, email: parent.email, role: 'parent' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    sendLoginAlert(parent, 'parent', req);

    res.json({
      message: 'Parent authenticated successfully.',
      token,
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email
      }
    });

  } catch (error) {
    console.error('Parent Login Error:', error.message);
    res.status(500).json({ message: 'Internal server database error during parent login.' });
  }
};

/**
 * @desc    Fetch pending leaves for approval
 * @route   GET /parent/pending
 * @access  Private (Parent)
 */
const getPendingLeaves = async (req, res) => {
  try {
    const parentId = req.user.id;
    // Get parent's studentId
    const parentRows = await db.query('SELECT studentId FROM Parents WHERE id = ?', [parentId]);
    if (parentRows.length === 0 || !parentRows[0].studentId) {
      return res.json([]);
    }

    const studentId = parentRows[0].studentId;
    const leaves = await db.query(
      'SELECT lr.id, lr.studentId, lr.reason, lr.fromDate, lr.toDate, lr.expectedTimeOut, lr.expectedTimeIn, lr.destination, lr.parentPhone, lr.status, s.name as studentName FROM LeaveRequests lr JOIN students s ON lr.studentId = s.id WHERE lr.studentId = ? AND lr.status = ? ORDER BY lr.createdAt DESC',
      [studentId, 'Pending']
    );

    res.json(leaves);
  } catch (error) {
    console.error('Fetch Parent Pending Leaves Error:', error.message);
    res.status(500).json({ message: 'Internal server error fetching pending leaves.' });
  }
};

/**
 * @desc    Parent approve leave request
 * @route   PUT /parent/approve/:id
 * @access  Private (Parent)
 */
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE LeaveRequests SET status = ?, parentStatus = ? WHERE id = ?',
      ['Approved', 'Approved', Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave request not found or already processed.' });
    }

    try {
      const leaves = await db.query('SELECT studentId FROM LeaveRequests WHERE id = ?', [Number(id)]);
      if (leaves.length > 0) {
        const studentId = leaves[0].studentId;
        const students = await db.query('SELECT email FROM students WHERE id = ?', [studentId]);
        if (students.length > 0) {
          const studentEmail = students[0].email;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #1e3a8a;">Parent Approved Your Leave Request</h2>
              <p>Your leave request has been approved by your parent.</p>
              <p>Waiting for Warden Approval.</p>
            </div>
          `;
          sendEmail(studentEmail, 'Parent Approved Your Leave Request', 'Your leave request has been approved by your parent.', emailHtml);
        }
      }
    } catch (e) {
      console.error('Error sending parent approval email:', e);
    }

    res.json({ message: 'Leave request has been approved successfully.' });
  } catch (error) {
    console.error('Parent Approve Leave Error:', error.message);
    res.status(500).json({ message: 'Internal server error approving leave.' });
  }
};

/**
 * @desc    Parent reject leave request
 * @route   PUT /parent/reject/:id
 * @access  Private (Parent)
 */
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE LeaveRequests SET status = ?, parentStatus = ?, finalStatus = ? WHERE id = ?',
      ['Rejected', 'Rejected', 'Rejected', Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave request not found or already processed.' });
    }

    try {
      const leaves = await db.query('SELECT studentId, reason FROM LeaveRequests WHERE id = ?', [Number(id)]);
      if (leaves.length > 0) {
        const studentId = leaves[0].studentId;
        const students = await db.query('SELECT email FROM students WHERE id = ?', [studentId]);
        if (students.length > 0) {
          const studentEmail = students[0].email;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #dc2626;">Leave Request Rejected</h2>
              <p>Your leave request has been rejected.</p>
              <p><strong>Reason:</strong> Rejected by Parent</p>
              <p>Please contact hostel administration for more information.</p>
            </div>
          `;
          sendEmail(studentEmail, 'Leave Request Rejected', 'Your leave request has been rejected.', emailHtml);
        }
      }
    } catch (e) {
      console.error('Error sending parent rejection email:', e);
    }

    res.json({ message: 'Leave request has been rejected.' });
  } catch (error) {
    console.error('Parent Reject Leave Error:', error.message);
    res.status(500).json({ message: 'Internal server error rejecting leave.' });
  }
};

/**
 * @desc    GET parent profile
 * @route   GET /parent/profile
 * @access  Private
 */
const getParentProfile = async (req, res) => {
  try {
    const parentId = req.user.id;
    const rows = await db.query(
      'SELECT id, name, email, phone, studentId, profileImage FROM Parents WHERE id = ?',
      [parentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Parent profile not found.' });
    }

    const parent = rows[0];
    let studentName = '';
    if (parent.studentId) {
      const studentRows = await db.query('SELECT name FROM students WHERE id = ?', [parent.studentId]);
      if (studentRows.length > 0) {
        studentName = studentRows[0].name;
      }
    }

    res.json({
      ...parent,
      studentName
    });
  } catch (error) {
    console.error('Get Parent Profile Error:', error.message);
    res.status(500).json({ message: 'Error retrieving profile.' });
  }
};

/**
 * @desc    UPDATE parent profile
 * @route   PUT /parent/profile
 * @access  Private
 */
const updateParentProfile = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { name, email, phone, profileImage } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    await db.query(
      'UPDATE Parents SET name = ?, email = ?, phone = ?, profileImage = ? WHERE id = ?',
      [name, email, phone || '', profileImage || '', parentId]
    );

    res.json({ message: 'Parent profile updated successfully.' });
  } catch (error) {
    console.error('Update Parent Profile Error:', error.message);
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

/**
 * @desc    Change parent password
 * @route   PUT /parent/change-password
 * @access  Private
 */
const changeParentPassword = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const rows = await db.query('SELECT email, password FROM Parents WHERE id = ?', [parentId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Parent not found.' });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Parents SET password = ? WHERE id = ?', [hashedPassword, parentId]);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Security Alert</h2>
        <p>We detected a security-related activity on your account.</p>
        <p>Activity: <strong>Password Changed Successfully</strong></p>
        <p>If this was not you, please contact administration immediately.</p>
      </div>
    `;
    if (rows[0].email) {
      await sendEmail(rows[0].email, 'Security Alert: Password Changed', 'Your password was changed.', emailHtml);
    }

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change Parent Password Error:', error.message);
    res.status(500).json({ message: 'Error changing password.' });
  }
};

/**
 * @desc    GET child leave history
 * @route   GET /parent/leave-history
 * @access  Private
 */
const getParentLeaveHistory = async (req, res) => {
  try {
    const parentId = req.user.id;

    const parentRows = await db.query('SELECT studentId FROM Parents WHERE id = ?', [parentId]);
    if (parentRows.length === 0 || !parentRows[0].studentId) {
      return res.json([]);
    }

    const studentId = parentRows[0].studentId;

    const leaves = await db.query(
      `SELECT lr.id, lr.reason, lr.fromDate, lr.toDate, lr.expectedTimeOut, lr.expectedTimeIn, lr.actualTimeOut, lr.actualTimeIn, lr.status, s.name as studentName 
       FROM LeaveRequests lr
       JOIN students s ON lr.studentId = s.id
       WHERE lr.studentId = ?
       ORDER BY lr.createdAt DESC`,
      [studentId]
    );

    res.json(leaves);
  } catch (error) {
    console.error('Get Parent Leave History Error:', error.message);
    res.status(500).json({ message: 'Error retrieving child leave history.' });
  }
};

module.exports = {
  loginParent,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getParentProfile,
  updateParentProfile,
  changeParentPassword,
  getParentLeaveHistory
};
