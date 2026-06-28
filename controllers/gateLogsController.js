const db = require('../config/db');

/**
 * @desc    Get all gate logs with filtering
 * @route   GET /gatelogs
 */
const getGateLogs = async (req, res) => {
  try {
    const { search, status } = req.query;
    const logs = await db.query('SELECT * FROM GateLogs');
    const students = await db.query('SELECT id, name, hostelRoom FROM students');
    const leaves = await db.query('SELECT id, destination FROM LeaveRequests');

    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s; });

    const leaveMap = {};
    leaves.forEach(l => { leaveMap[l.id] = l; });

    let mapped = logs.map(g => {
      const student = studentMap[g.studentId] || {};
      const leave = leaveMap[g.leaveId] || {};
      return {
        id: g.id,
        studentId: g.studentId,
        leaveId: g.leaveId,
        studentName: student.name || 'Unknown',
        hostelRoom: student.hostelRoom || 'Unknown',
        destination: leave.destination || 'Unknown',
        exitTime: g.exitTime,
        entryTime: g.entryTime,
        status: g.status
      };
    });

    if (status && status !== 'All') {
      mapped = mapped.filter(g => g.status === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      mapped = mapped.filter(g =>
        g.studentName.toLowerCase().includes(q) ||
        g.hostelRoom.toLowerCase().includes(q) ||
        g.destination.toLowerCase().includes(q) ||
        g.id.toString().includes(q)
      );
    }

    // Sort by id descending (most recent first)
    mapped.sort((a, b) => b.id - a.id);

    res.json(mapped);
  } catch (error) {
    console.error('Get Gate Logs Error:', error.message);
    res.status(500).json({ message: 'Error retrieving gate logs.' });
  }
};

/**
 * @desc    Get single gate log by ID
 * @route   GET /gatelogs/:id
 */
const getGateLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await db.query('SELECT * FROM GateLogs WHERE id = ?', [Number(id)]);
    if (logs.length === 0) {
      return res.status(404).json({ message: 'Gate log not found.' });
    }

    const log = logs[0];
    const students = await db.query('SELECT name, hostelRoom FROM students WHERE id = ?', [log.studentId]);
    log.studentName = students.length > 0 ? students[0].name : 'Unknown';
    log.hostelRoom = students.length > 0 ? students[0].hostelRoom : 'Unknown';

    res.json(log);
  } catch (error) {
    console.error('Get Gate Log By ID Error:', error.message);
    res.status(500).json({ message: 'Error retrieving gate log details.' });
  }
};

module.exports = {
  getGateLogs,
  getGateLogById
};
