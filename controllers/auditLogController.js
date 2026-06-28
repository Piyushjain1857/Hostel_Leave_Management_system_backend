const db = require('../config/db');

exports.getLogs = async (req, res) => {
  try {
    const logs = await db.query('SELECT * FROM AuditLogs');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportLogs = async (req, res) => {
  try {
    const logs = await db.query('SELECT * FROM AuditLogs');
    res.json({ message: 'Export successful', data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
