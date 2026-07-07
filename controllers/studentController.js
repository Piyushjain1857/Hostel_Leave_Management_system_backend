const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Fetch Student Profile, Leave Statistics & Recent Leaves
 * @route   GET /api/student/dashboard
 * @access  Private (Guarded by JWT protect)
 */
const getDashboardData = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Fetch Student Profile details
    const studentRows = await db.query(
      'SELECT id, name, email, hostelRoom, profileImage, coverImage, created_at FROM students WHERE id = ?',
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const student = studentRows[0];

    // 2. Fetch statistics (Total, Approved, Pending counts) using SQL COUNT queries
    const totalCountResult = await db.query(
      'SELECT COUNT(*) AS count FROM LeaveRequests WHERE studentId = ?',
      [studentId]
    );
    const approvedCountResult = await db.query(
      'SELECT COUNT(*) AS count FROM LeaveRequests WHERE studentId = ? AND status = ?',
      [studentId, 'Approved']
    );
    const pendingCountResult = await db.query(
      'SELECT COUNT(*) AS count FROM LeaveRequests WHERE studentId = ? AND status = ?',
      [studentId, 'Pending']
    );

    const stats = {
      total: totalCountResult[0]?.count !== undefined ? Number(totalCountResult[0].count) : totalCountResult.length,
      approved: approvedCountResult[0]?.count !== undefined ? Number(approvedCountResult[0].count) : approvedCountResult.length,
      pending: pendingCountResult[0]?.count !== undefined ? Number(pendingCountResult[0].count) : pendingCountResult.length
    };

    // 3. Fetch recent 5 leave requests
    const recentLeaves = await db.query(
      'SELECT id, reason, fromDate AS "startDate", toDate AS "endDate", status, createdAt AS "created_at" FROM LeaveRequests WHERE studentId = ? ORDER BY createdAt DESC LIMIT 5',
      [studentId]
    );

    // 4. Return everything in a unified dashboard response payload
    res.json({
      message: 'Dashboard data fetched successfully.',
      student,
      stats,
      recentLeaves
    });

  } catch (error) {
    console.error('Fetch Dashboard Error:', error);
    res.status(500).json({ message: 'Internal server error while fetching student dashboard details.' });
  }
};

/**
 * @desc    Fetch all leave requests for the logged-in student
 * @route   GET /api/student/leaves
 * @access  Private (Guarded by JWT protect)
 */
const getLeavesList = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all leave records sorted by creation date descending
    const leaves = await db.query(
      'SELECT id, reason, fromDate AS "startDate", toDate AS "endDate", status, createdAt AS "created_at" FROM LeaveRequests WHERE studentId = ? ORDER BY createdAt DESC',
      [studentId]
    );

    res.json(leaves);

  } catch (error) {
    console.error('Fetch Leaves Error:', error);
    res.status(500).json({ message: 'Internal server error while fetching leave history.' });
  }
};

/**
 * @desc    Submit a new leave request
 * @route   POST /api/student/leaves
 * @access  Private (Guarded by JWT protect)
 */
const applyLeave = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { reason, startDate, endDate } = req.body;

    // 1. Basic validation
    if (!reason || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide all required fields (reason, startDate, endDate).' });
    }

    if (reason.trim().length < 5) {
      return res.status(400).json({ message: 'Reason must be detailed (at least 5 characters).' });
    }

    // 2. Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start date or end date format.' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be prior to start date.' });
    }

    // 3. Save to database using parameterized SQL INSERT
    const insertResult = await db.query(
      'INSERT INTO LeaveRequests (studentId, reason, fromDate, toDate, destination, parentPhone) VALUES (?, ?, ?, ?, ?, ?)',
      [studentId, reason, startDate, endDate, 'N/A', 'N/A']
    );

    res.status(201).json({
      message: 'Leave request submitted successfully for Warden approval.',
      leaveId: insertResult.insertId
    });

  } catch (error) {
    console.error('Apply Leave Error:', error);
    res.status(500).json({ message: 'Internal server error while submitting leave request.' });
  }
};

/**
 * @desc    GET student profile details
 * @route   GET /student/profile
 * @access  Private
 */
const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const rows = await db.query(
      'SELECT id, name, email, phone, course, year, hostelRoom, profileImage, coverImage FROM students WHERE id = ?',
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const studentProfile = rows[0];

    const parentRows = await db.query(
      'SELECT name as parentName, email as parentEmail, phone as parentPhone, profileImage as parentProfileImage FROM Parents WHERE studentId = ?',
      [studentId]
    );

    if (parentRows.length > 0) {
      studentProfile.parentName = parentRows[0].parentName || parentRows[0].name;
      studentProfile.parentEmail = parentRows[0].parentEmail || parentRows[0].email;
      studentProfile.parentPhone = parentRows[0].parentPhone || parentRows[0].phone;
      studentProfile.parentProfileImage = parentRows[0].parentProfileImage || parentRows[0].profileImage;
    }

    res.json(studentProfile);
  } catch (error) {
    console.error('Get Student Profile Error:', error);
    res.status(500).json({ message: 'Internal server error fetching profile.' });
  }
};

/**
 * @desc    UPDATE student profile details
 * @route   PUT /student/profile
 * @access  Private
 */
const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { name, email, phone, course, year, hostelRoom, profileImage, coverImage } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required.' });
    }

    await db.query(
      'UPDATE students SET name = ?, email = ?, phone = ?, course = ?, year = ?, hostelRoom = ?, profileImage = ?, coverImage = ? WHERE id = ?',
      [name, email, phone || '', course || '', year || '', hostelRoom || '', profileImage || '', coverImage || '', studentId]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update Student Profile Error:', error);
    res.status(500).json({ message: 'Internal server error updating profile.' });
  }
};

/**
 * @desc    Change student password
 * @route   PUT /student/change-password
 * @access  Private
 */
const changeStudentPassword = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const rows = await db.query('SELECT email, password FROM students WHERE id = ?', [studentId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE students SET password = ? WHERE id = ?', [hashedPassword, studentId]);

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
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Internal server error changing password.' });
  }
};

module.exports = {
  getDashboardData,
  getLeavesList,
  applyLeave,
  getStudentProfile,
  updateStudentProfile,
  changeStudentPassword
};
