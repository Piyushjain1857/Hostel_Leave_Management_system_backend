const db = require('../config/db');

// @desc    Get Activity Logs
// @route   GET /api/activity-logs
// @access  Private
exports.getActivityLogs = async (req, res) => {
  try {
    const { role } = req.query;
    let queryStr = 'SELECT * FROM ActivityLogs';
    let params = [];
    if (role && role !== 'all') {
      queryStr += ' WHERE role = ?';
      params.push(role);
    }
    const logs = await db.query(queryStr, params);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching activity logs' });
  }
};

// @desc    Export Activity Logs
// @route   GET /api/activity-logs/export
// @access  Private
exports.exportActivityLogs = async (req, res) => {
  // In a real app, this would generate CSV/PDF. Here we just return JSON data to be converted by frontend.
  try {
    const logs = await db.query('SELECT * FROM ActivityLogs');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
