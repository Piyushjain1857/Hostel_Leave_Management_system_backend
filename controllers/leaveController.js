const db = require('../config/db');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Submit a new leave request
 * @route   POST /leave/apply
 * @access  Private (Student)
 */
const applyLeave = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { reason, fromDate, toDate, destination, parentPhone, expectedTimeOut, expectedTimeIn } = req.body;

    if (!reason || !fromDate || !toDate || !destination || !parentPhone || !expectedTimeOut || !expectedTimeIn) {
      return res.status(400).json({ message: 'All form fields are required.' });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (end < start) {
      return res.status(400).json({ message: 'Return date cannot be before departure date.' });
    }

    const phoneDigits = String(parentPhone).replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit parent phone number.' });
    }

    const result = await db.query(
      'INSERT INTO LeaveRequests (studentId, reason, fromDate, toDate, destination, parentPhone, expectedTimeOut, expectedTimeIn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, reason, fromDate, toDate, destination, parentPhone, expectedTimeOut, expectedTimeIn]
    );

    // Module 4: LEAVE REQUEST EMAILS
    try {
      const students = await db.query('SELECT name FROM students WHERE id = ?', [studentId]);
      const studentName = students.length > 0 ? students[0].name : 'Student';
      const parents = await db.query('SELECT email FROM Parents WHERE studentId = ?', [studentId]);
      
      if (parents.length > 0) {
        const parentEmail = parents[0].email;
        const leaveHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a;">New Leave Request Submitted</h2>
            <p>A new leave request has been submitted by your ward.</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0;"><strong>Student Name:</strong> ${studentName}</p>
              <p style="margin: 0;"><strong>Leave Dates:</strong> ${fromDate} to ${toDate}</p>
              <p style="margin: 0;"><strong>Destination:</strong> ${destination}</p>
              <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>Please log in to your Parent Dashboard to approve or reject this request.</p>
          </div>
        `;
        await sendEmail(parentEmail, 'New Leave Request Submitted', `Leave request from ${studentName}`, leaveHtml);
      }
    } catch (emailErr) {
      console.error('Error sending parent email:', emailErr);
    }

    res.status(201).json({
      message: 'Leave request submitted successfully! Status: Pending.',
      leaveId: result.insertId || result[0]?.insertId
    });

  } catch (error) {
    console.error('Apply Leave Error:', error.message);
    res.status(500).json({ message: 'Internal server error while submitting leave request.' });
  }
};

/**
 * @desc    Fetch student leave history
 * @route   GET /leave/history
 * @access  Private (Student)
 */
const getLeaveHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const leaves = await db.query(
      'SELECT * FROM LeaveRequests WHERE studentId = ? ORDER BY createdAt DESC',
      [studentId]
    );

    res.json(leaves);
  } catch (error) {
    console.error('Fetch Leave History Error:', error.message);
    res.status(500).json({ message: 'Internal server error while fetching leave history.' });
  }
};

/**
 * @desc    Fetch specific leave details by ID
 * @route   GET /leave/:id
 * @access  Private
 */
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(id)]);

    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    res.json(leaves[0]);
  } catch (error) {
    console.error('Fetch Leave By ID Error:', error.message);
    res.status(500).json({ message: 'Internal server error fetching leave details.' });
  }
};

/**
 * @desc    Generate QR code for approved leave
 * @route   POST /leave/generate-qr
 * @access  Private
 */
const generateQR = async (req, res) => {
  try {
    const { leaveId } = req.body;
    if (!leaveId) {
      return res.status(400).json({ message: 'Leave ID is required to generate a gate pass.' });
    }

    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(leaveId)]);
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    const leave = leaves[0];
    const students = await db.query('SELECT name FROM students WHERE id = ?', [leave.studentId]);
    const studentName = students.length > 0 ? students[0].name : 'Student';

    // Verification link encoded inside the QR payload
    // E.g. http://localhost:5005/verify-pass?id=101
    const qrPayload = JSON.stringify({
      leaveId: leave.id,
      studentId: leave.studentId,
      studentName,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      destination: leave.destination,
      status: leave.status
    });

    const encodedData = encodeURIComponent(qrPayload);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;

    // Note: If MySQL is active, you can save QR details inside the DB.
    // For now we'll just send the details back to the client.
    res.json({
      leaveId: leave.id,
      studentName,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      destination: leave.destination,
      status: leave.status,
      qrUrl
    });

  } catch (error) {
    console.error('Generate QR Error:', error.message);
    res.status(500).json({ message: 'Internal server error generating QR code.' });
  }
};

module.exports = {
  applyLeave,
  getLeaveHistory,
  getLeaveById,
  generateQR
};
