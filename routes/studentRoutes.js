const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getDashboardData, 
  getLeavesList, 
  applyLeave,
  getStudentProfile,
  updateStudentProfile,
  changeStudentPassword
} = require('../controllers/studentController');

// Guard all subsequent routes with token check
router.use(protect);

// GET /api/student/dashboard - Fetch stats & recent leave requests
router.get('/dashboard', getDashboardData);

// GET /api/student/leaves - Fetch full list of leave requests
router.get('/leaves', getLeavesList);

// POST /api/student/leaves - Submit a new leave request
router.post('/leaves', applyLeave);

// User Profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.put('/change-password', changeStudentPassword);

module.exports = router;
