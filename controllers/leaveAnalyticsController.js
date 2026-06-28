const db = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM LeaveRequests');
    const total = leaves.length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    const active = leaves.filter(l => new Date(l.fromDate) <= new Date() && new Date(l.toDate) >= new Date() && l.status === 'Approved').length;
    
    // Mock trends
    const trends = [
      { month: 'Jan', count: 10 },
      { month: 'Feb', count: 15 },
      { month: 'Mar', count: 8 },
      { month: 'Apr', count: 20 },
      { month: 'May', count: total }
    ];

    res.json({
      total, approved, rejected, active, trends
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM LeaveRequests');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
