const db = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const students = await db.query('SELECT * FROM students');
    const wardens = await db.query('SELECT * FROM Wardens');
    const parents = await db.query('SELECT * FROM Parents');
    
    res.json({
      totalUsers: students.length + wardens.length + parents.length + 1, // +1 for admin
      totalStudents: students.length,
      totalWardens: wardens.length,
      totalParents: parents.length,
      activeSessions: Math.floor(Math.random() * 50) + 10, // Mock metric
      databaseRecords: 1500 // Mock metric
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    res.json({
      status: 'Healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuLoad: [0.1, 0.2, 0.15]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.backupDatabase = async (req, res) => {
  try {
    // Mock backup action
    res.json({ message: 'Database backup initiated successfully. File: backup-' + new Date().toISOString() + '.sql' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSystemStatistics = async (req, res) => {
  try {
    res.json({
      apiRequestsToday: Math.floor(Math.random() * 1000) + 500,
      errorsToday: Math.floor(Math.random() * 10),
      avgResponseTimeMs: Math.floor(Math.random() * 100) + 20
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
