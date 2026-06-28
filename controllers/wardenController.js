const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendLoginAlert } = require('./authController');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Authenticate Warden & Get Token
 * @route   POST /warden/login
 * @access  Public
 */
const loginWarden = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password fields are required.' });
    }

    const wardens = await db.query('SELECT * FROM Wardens WHERE email = ?', [email]);
    if (wardens.length === 0) {
      return res.status(400).json({ message: 'Invalid warden credentials.' });
    }

    const warden = wardens[0];
    
    if (warden.isVerified === 0 || warden.isVerified === false) {
      if (warden.isVerified !== undefined) {
          return res.status(403).json({ message: 'Account not verified. Please verify your email first.', unverified: true });
      }
    }

    const isMatch = await bcrypt.compare(password, warden.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid warden credentials.' });
    }

    const token = jwt.sign(
      { id: warden.id, email: warden.email, role: 'warden' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    sendLoginAlert(warden, 'warden', req);

    res.json({
      message: 'Warden authenticated successfully.',
      token,
      warden: {
        id: warden.id,
        name: warden.name,
        email: warden.email
      }
    });

  } catch (error) {
    console.error('Warden Login Error:', error.message);
    res.status(500).json({ message: 'Internal server database error during warden login.' });
  }
};

/**
 * @desc    Warden Dashboard statistics & pending listings
 * @route   GET /warden/dashboard
 * @access  Private (Warden)
 */
const getWardenDashboard = async (req, res) => {
  try {
    // 1. Fetch total leaves and count pendings
    const leaves = await db.query('SELECT * FROM LeaveRequests');
    const logs = await db.query('SELECT * FROM GateLogs');

    const total = leaves.length;
    const pending = leaves.filter(x => x.status === 'Pending').length;
    const approved = leaves.filter(x => x.status === 'Approved').length;
    const checkedOut = logs.filter(x => x.status === 'Checked-Out').length;

    // 2. Fetch pending leaves
    const pendingLeaves = leaves.filter(x => x.status === 'Pending').slice(0, 10);

    // 3. Map student names to leave lists for cleaner display
    const students = await db.query('SELECT id, name, hostelRoom FROM students');
    const studentMap = {};
    students.forEach(s => {
      studentMap[s.id] = { name: s.name, room: s.hostelRoom };
    });

    const pendingLeavesWithStudent = pendingLeaves.map(l => ({
      ...l,
      studentName: studentMap[l.studentId]?.name || 'Student',
      hostelRoom: studentMap[l.studentId]?.room || 'Unknown'
    }));

    // 4. Return summary payload
    res.json({
      stats: {
        total,
        pending,
        approved,
        checkedOut
      },
      pendingLeaves: pendingLeavesWithStudent
    });

  } catch (error) {
    console.error('Warden Dashboard Error:', error.message);
    res.status(500).json({ message: 'Internal server error loading warden dashboard.' });
  }
};

/**
 * @desc    Warden get pending leaves
 * @route   GET /warden/pending
 * @access  Private (Warden)
 */
const getWardenPending = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE status = ?', ['Pending']);
    const students = await db.query('SELECT id, name, hostelRoom FROM students');
    const studentMap = {};
    students.forEach(s => {
      studentMap[s.id] = { name: s.name, room: s.hostelRoom };
    });

    const leavesWithStudent = leaves.map(l => ({
      ...l,
      studentName: studentMap[l.studentId]?.name || 'Student',
      hostelRoom: studentMap[l.studentId]?.room || 'Unknown'
    }));

    res.json(leavesWithStudent);
  } catch (error) {
    console.error('Warden Get Pending Leaves Error:', error.message);
    res.status(500).json({ message: 'Internal server error fetching pending leaves.' });
  }
};

/**
 * @desc    GET warden profile
 * @route   GET /warden/profile
 * @access  Private
 */
const getWardenProfile = async (req, res) => {
  try {
    const wardenId = req.user.id;
    const rows = await db.query(
      'SELECT id, name, email, phone, hostelAssigned, shift, profileImage FROM Wardens WHERE id = ?',
      [wardenId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Warden profile not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get Warden Profile Error:', error.message);
    res.status(500).json({ message: 'Error retrieving warden profile.' });
  }
};

/**
 * @desc    UPDATE warden profile
 * @route   PUT /warden/profile
 * @access  Private
 */
const updateWardenProfile = async (req, res) => {
  try {
    const wardenId = req.user.id;
    const { name, email, phone, hostelAssigned, shift, profileImage } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    await db.query(
      'UPDATE Wardens SET name = ?, email = ?, phone = ?, hostelAssigned = ?, shift = ?, profileImage = ? WHERE id = ?',
      [name, email, phone || '', hostelAssigned || '', shift || '', profileImage || '', wardenId]
    );

    res.json({ message: 'Warden profile updated successfully.' });
  } catch (error) {
    console.error('Update Warden Profile Error:', error.message);
    res.status(500).json({ message: 'Error updating warden profile.' });
  }
};

/**
 * @desc    Change warden password
 * @route   PUT /warden/change-password
 * @access  Private
 */
const changeWardenPassword = async (req, res) => {
  try {
    const wardenId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const rows = await db.query('SELECT email, password FROM Wardens WHERE id = ?', [wardenId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Warden not found.' });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Wardens SET password = ? WHERE id = ?', [hashedPassword, wardenId]);

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
    console.error('Change Warden Password Error:', error.message);
    res.status(500).json({ message: 'Error changing password.' });
  }
};

/**
 * @desc    Warden approve leave
 * @route   PUT /warden/approve/:id
 * @access  Private
 */
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE LeaveRequests SET status = ?, wardenStatus = ?, finalStatus = ? WHERE id = ?',
      ['Approved', 'Approved', 'Approved', Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave request not found or already processed.' });
    }

    try {
      const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(id)]);
      if (leaves.length > 0) {
        const leave = leaves[0];
        const students = await db.query('SELECT name, email FROM students WHERE id = ?', [leave.studentId]);
        if (students.length > 0) {
          const student = students[0];
          const qrPayload = JSON.stringify({
            leaveId: leave.id,
            studentId: leave.studentId,
            studentName: student.name,
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            destination: leave.destination,
            status: 'Approved'
          });
          const encodedData = encodeURIComponent(qrPayload);
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #16a34a;">Your Leave Has Been Approved</h2>
              <p>Hello ${student.name},</p>
              <p>Your leave request has been approved by the hostel warden.</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 0;"><strong>Leave ID:</strong> #${leave.id}</p>
                <p style="margin: 0;"><strong>Dates:</strong> ${leave.fromDate} to ${leave.toDate}</p>
              </div>
              <p>Your QR Gate Pass is attached below. Please show this QR code at the hostel gate when exiting and entering.</p>
              <div style="text-align: center; margin-top: 20px;">
                <img src="${qrUrl}" alt="QR Gate Pass" style="border: 2px solid #1e3a8a; border-radius: 8px; padding: 10px;" />
              </div>
            </div>
          `;
          sendEmail(student.email, 'Your Leave Has Been Approved', 'Your leave request has been approved.', emailHtml);
        }
      }
    } catch (e) {
      console.error('Error sending warden approval email:', e);
    }

    res.json({ message: 'Leave request approved successfully.' });
  } catch (error) {
    console.error('Warden Approve Leave Error:', error.message);
    res.status(500).json({ message: 'Error approving leave.' });
  }
};

/**
 * @desc    Warden reject leave
 * @route   PUT /warden/reject/:id
 * @access  Private
 */
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE LeaveRequests SET status = ?, wardenStatus = ?, finalStatus = ? WHERE id = ?',
      ['Rejected', 'Rejected', 'Rejected', Number(id)]
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
              <h2 style="color: #dc2626;">Leave Request Rejected</h2>
              <p>Your leave request has been rejected.</p>
              <p><strong>Reason:</strong> Rejected by Warden</p>
              <p>Please contact hostel administration for more information.</p>
            </div>
          `;
          sendEmail(studentEmail, 'Leave Request Rejected', 'Your leave request has been rejected.', emailHtml);
        }
      }
    } catch (e) {
      console.error('Error sending warden rejection email:', e);
    }

    res.json({ message: 'Leave request rejected.' });
  } catch (error) {
    console.error('Warden Reject Leave Error:', error.message);
    res.status(500).json({ message: 'Error rejecting leave.' });
  }
};

module.exports = {
  loginWarden,
  getWardenDashboard,
  getWardenPending,
  getWardenProfile,
  updateWardenProfile,
  changeWardenPassword,
  approveLeave,
  rejectLeave
};
