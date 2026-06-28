const db = require('../config/db');

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await db.query('SELECT * FROM Attendance');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addAttendance = async (req, res) => {
  try {
    const { studentId, checkInTime, checkOutTime, date, status } = req.body;
    await db.query(
      'INSERT INTO Attendance (studentId, checkInTime, checkOutTime, date, status) VALUES (?, ?, ?, ?, ?)',
      [studentId, checkInTime || null, checkOutTime || null, date, status || 'Present']
    );
    res.status(201).json({ message: 'Attendance added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    // Return mock data for report
    const att = await db.query('SELECT * FROM Attendance');
    const total = att.length;
    const present = att.filter(a => a.status === 'Present').length;
    res.json({
      totalDays: total,
      presentDays: present,
      attendancePercentage: total ? ((present / total) * 100).toFixed(2) : 0,
      records: att
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
