const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendLoginAlert } = require('./authController');

/**
 * @desc    Authenticate Admin & Get Token
 * @route   POST /admin/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admins = await db.query('SELECT * FROM Admins WHERE email = ?', [email]);
    if (admins.length === 0) {
      return res.status(400).json({ message: 'Invalid admin credentials.' });
    }

    const admin = admins[0];
    
    if (admin.isVerified === 0 || admin.isVerified === false) {
      if (admin.isVerified !== undefined) {
          return res.status(403).json({ message: 'Account not verified. Please verify your email first.', unverified: true });
      }
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    sendLoginAlert(admin, 'admin', req);

    res.json({
      message: 'Admin authenticated successfully.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({ message: 'Database error during admin login.' });
  }
};

/**
 * @desc    Fetch Admin Dashboard Stats
 * @route   GET /admin/dashboard
 * @access  Private (Admin)
 */
const getAdminDashboard = async (req, res) => {
  try {
    // Fetch counts from tables
    const students = await db.query('SELECT id FROM students');
    const parents = await db.query('SELECT id FROM Parents');
    const wardens = await db.query('SELECT id FROM Wardens');
    const leaves = await db.query('SELECT * FROM LeaveRequests');

    const totalStudents = students.length;
    const totalParents = parents.length;
    const totalWardens = wardens.length;
    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter(x => x.status === 'Approved' || x.status === 'Completed' || x.status === 'Checked-Out').length;
    const pendingLeaves = leaves.filter(x => x.status === 'Pending').length;

    res.json({
      stats: {
        totalStudents,
        totalParents,
        totalWardens,
        totalLeaves,
        approvedLeaves,
        pendingLeaves
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error.message);
    res.status(500).json({ message: 'Error loading admin stats.' });
  }
};

/**
 * @desc    Fetch Detailed Stats Analytics
 * @route   GET /admin/stats
 * @access  Private (Admin)
 */
const getAdminStats = async (req, res) => {
  try {
    const leaves = await db.query('SELECT status, createdAt FROM LeaveRequests');
    res.json(leaves);
  } catch (error) {
    console.error('Admin Analytics Stats Error:', error.message);
    res.status(500).json({ message: 'Error loading detailed stats.' });
  }
};

/**
 * @desc    Fetch Recent Activities Log
 * @route   GET /admin/recent-activities
 * @access  Private (Admin)
 */
const getRecentActivities = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM LeaveRequests ORDER BY createdAt DESC LIMIT 10');
    const logs = await db.query('SELECT * FROM GateLogs ORDER BY id DESC LIMIT 10');
    const students = await db.query('SELECT id, name FROM students');

    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s.name; });

    const activities = [];

    // Map leaves to activities
    leaves.forEach(l => {
      activities.push({
        type: 'leave',
        id: l.id,
        studentName: studentMap[l.studentId] || 'Student',
        message: `Applied outpass for "${l.destination}"`,
        status: l.status,
        timestamp: l.createdAt
      });
    });

    // Map gate logs to activities
    logs.forEach(g => {
      activities.push({
        type: 'gate',
        id: g.id,
        studentName: studentMap[g.studentId] || 'Student',
        message: g.status === 'Checked-Out' ? 'Checked out at main gate' : 'Checked back in at main gate',
        status: g.status,
        timestamp: g.exitTime || g.entryTime || new Date()
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Admin Recent Activities Error:', error.message);
    res.status(500).json({ message: 'Error loading recent activities.' });
  }
};

module.exports = {
  loginAdmin,
  getAdminDashboard,
  getAdminStats,
  getRecentActivities
};
