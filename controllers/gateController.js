const db = require('../config/db');

/**
 * @desc    Verify QR payload
 * @route   POST /qr/verify
 * @access  Public (Security Guard Scanner Simulator)
 */
const verifyQR = async (req, res) => {
  try {
    const { qrText } = req.body;
    if (!qrText) {
      return res.status(400).json({ message: 'QR payload string is required.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(qrText);
    } catch {
      return res.status(400).json({ message: 'Invalid QR code payload format.' });
    }

    const { leaveId } = parsed;
    if (!leaveId) {
      return res.status(400).json({ message: 'QR code does not contain a valid Leave ID.' });
    }

    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(leaveId)]);
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave request not found in database.' });
    }

    const leave = leaves[0];
    const students = await db.query('SELECT name, hostelRoom, email FROM students WHERE id = ?', [leave.studentId]);
    const student = students.length > 0 ? students[0] : null;

    res.json({
      verified: true,
      message: 'QR Pass is verified.',
      leave: {
        id: leave.id,
        reason: leave.reason,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        destination: leave.destination,
        status: leave.status
      },
      student: student ? {
        name: student.name,
        email: student.email,
        room: student.hostelRoom
      } : null
    });

  } catch (error) {
    console.error('Verify QR Error:', error.message);
    res.status(500).json({ message: 'Internal server error verifying QR.' });
  }
};

/**
 * @desc    Record Gate Exit Punch
 * @route   POST /gate/exit
 * @access  Public
 */
const logExit = async (req, res) => {
  try {
    const { leaveId } = req.body;
    if (!leaveId) {
      return res.status(400).json({ message: 'Leave ID is required for exit.' });
    }

    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(leaveId)]);
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    const leave = leaves[0];
    if (leave.status !== 'Approved') {
      return res.status(400).json({ message: `Leave request must be Approved. Current status: ${leave.status}` });
    }

    // 1. Insert exit punch into GateLogs
    const now = new Date();
    await db.query(
      'INSERT INTO GateLogs (studentId, leaveId, exitTime, entryTime, status) VALUES (?, ?, ?, ?, ?)',
      [leave.studentId, leave.id, now, null, 'Out']
    );

    // 2. Update leave request state
    await db.query('UPDATE LeaveRequests SET status = ?, actualTimeOut = ? WHERE id = ?', ['Out', now, leave.id]);

    res.status(201).json({
      message: 'Exit recorded successfully. Student is Out.',
      status: 'Out'
    });

  } catch (error) {
    console.error('Log Gate Exit Error:', error.message);
    res.status(500).json({ message: 'Internal server error recording gate exit.' });
  }
};

/**
 * @desc    Record Gate Return Punch
 * @route   POST /gate/return
 * @access  Public
 */
const logReturn = async (req, res) => {
  try {
    const { leaveId } = req.body;
    if (!leaveId) {
      return res.status(400).json({ message: 'Leave ID is required for return.' });
    }

    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(leaveId)]);
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    const leave = leaves[0];

    const now = new Date();
    let newStatus = 'Returned';

    if (leave.expectedTimeIn) {
      const expectedTimeStr = typeof leave.expectedTimeIn === 'string' ? leave.expectedTimeIn : leave.expectedTimeIn.toString();
      const [expectedHours, expectedMinutes] = expectedTimeStr.split(':');
      const expectedDateTime = new Date();
      expectedDateTime.setHours(parseInt(expectedHours, 10), parseInt(expectedMinutes, 10), 0, 0);

      if (now > expectedDateTime) {
        newStatus = 'Late Return';
      }
    }

    // Update exit logs with return time
    await db.query(
      'UPDATE GateLogs SET entryTime = ?, status = ? WHERE leaveId = ?',
      [now, newStatus, leave.id]
    );

    // Update leave request state
    await db.query('UPDATE LeaveRequests SET status = ?, actualTimeIn = ? WHERE id = ?', [newStatus, now, leave.id]);

    res.json({
      message: `Return recorded successfully. Student checked back in. Status: ${newStatus}`,
      status: newStatus
    });

  } catch (error) {
    console.error('Log Gate Return Error:', error.message);
    res.status(500).json({ message: 'Internal server error recording gate return.' });
  }
};

module.exports = {
  verifyQR,
  logExit,
  logReturn
};
