const db = require('../config/db');

// @desc    Get Active Leaves (Approved & currently out)
// @route   GET /api/advanced-leaves/active
// @access  Private
exports.getActiveLeaves = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM leaverequests WHERE status = ?', ['Approved']);
    // Mock simple join for student name & hostel
    const students = await db.query('SELECT * FROM students');
    
    const enrichedLeaves = leaves.map(leave => {
      const student = students.find(s => s.id === leave.studentId);
      return {
        ...leave,
        studentName: student?.name || 'Unknown',
        hostel: student?.hostelRoom?.split(' ')[0] || 'Unknown'
      };
    });

    res.json(enrichedLeaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Active Leave Stats
// @route   GET /api/advanced-leaves/active/stats
// @access  Private
exports.getActiveLeavesStats = async (req, res) => {
  try {
    const stats = await db.query('SELECT COUNT(*) AS active_leaves FROM leaverequests');
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Approved Leaves Analytics
// @route   GET /api/advanced-leaves/approved/analytics
// @access  Private
exports.getApprovedAnalytics = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM leaverequests WHERE status = ?', ['Approved']);
    const students = await db.query('SELECT * FROM students');
    
    // Mock monthly data
    const monthlyData = [
      { name: 'Jan', value: 10 }, { name: 'Feb', value: 15 },
      { name: 'Mar', value: 8 }, { name: 'Apr', value: 20 },
      { name: 'May', value: leaves.length }
    ];

    const enrichedLeaves = leaves.map(leave => {
      const student = students.find(s => s.id === leave.studentId);
      return {
        ...leave,
        studentName: student?.name || 'Unknown',
        duration: Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)) + ' days'
      };
    });

    res.json({ analytics: monthlyData, recentApproved: enrichedLeaves });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Rejected Leaves Management
// @route   GET /api/advanced-leaves/rejected
// @access  Private
exports.getRejectedLeaves = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM leaverequests WHERE status = ?', ['Rejected']);
    const students = await db.query('SELECT * FROM students');
    
    const enrichedLeaves = leaves.map(leave => {
      const student = students.find(s => s.id === leave.studentId);
      return {
        ...leave,
        studentName: student?.name || 'Unknown',
        rejectionComment: 'Not approved by warden/parent' // Mock comment
      };
    });

    res.json(enrichedLeaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Rejected Leaves Analytics
// @route   GET /api/advanced-leaves/rejected/analytics
// @access  Private
exports.getRejectedAnalytics = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM leaverequests WHERE status = ?', ['Rejected']);
    res.json({
      totalRejected: leaves.length,
      topReason: 'Insufficient Information',
      rejectedThisWeek: leaves.length > 0 ? 1 : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
