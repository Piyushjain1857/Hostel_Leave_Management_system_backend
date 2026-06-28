const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  loginAdmin, 
  getAdminDashboard, 
  getAdminStats, 
  getRecentActivities 
} = require('../controllers/adminController');

// POST /admin/login - Authenticate Admin
router.post('/login', loginAdmin);

// Guard dashboard statistics endpoints with protect token validation
router.get('/dashboard', protect, getAdminDashboard);
router.get('/stats', protect, getAdminStats);
router.get('/recent-activities', protect, getRecentActivities);

module.exports = router;
