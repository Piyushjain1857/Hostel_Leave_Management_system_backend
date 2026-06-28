const db = require('../config/db');

/**
 * @desc    Get all students movement tracking logs
 * @route   GET /tracking/students
 * @access  Private (Warden/Admin)
 */
const getStudentTrackingLogs = async (req, res) => {
  try {
    const logs = await db.query(
      `SELECT gl.id, gl.exitTime, gl.entryTime, gl.leaveId, gl.status, s.name as studentName, s.hostelRoom 
       FROM GateLogs gl 
       JOIN students s ON gl.studentId = s.id 
       ORDER BY gl.exitTime DESC`
    );
    res.json(logs);
  } catch (error) {
    console.error('Get Student Tracking Logs Error:', error.message);
    res.status(500).json({ message: 'Error retrieving student movement gate logs.' });
  }
};

/**
 * @desc    Get tracking logs for a specific student
 * @route   GET /tracking/student/:id
 * @access  Private
 */
const getStudentTrackingLogsById = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await db.query(
      `SELECT gl.id, gl.exitTime, gl.entryTime, gl.leaveId, gl.status, s.name as studentName, s.hostelRoom 
       FROM GateLogs gl 
       JOIN students s ON gl.studentId = s.id 
       WHERE gl.studentId = ? 
       ORDER BY gl.exitTime DESC`,
      [Number(id)]
    );
    res.json(logs);
  } catch (error) {
    console.error('Get Student Logs By Id Error:', error.message);
    res.status(500).json({ message: 'Error retrieving student specific gate logs.' });
  }
};

module.exports = {
  getStudentTrackingLogs,
  getStudentTrackingLogsById
};
