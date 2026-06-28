const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLeaveReport,
  getStudentReport,
  getMovementReport,
  getReportDetails,
  exportReport
} = require('../controllers/reportController');

// Secure reports routes with protect validation
router.get('/leaves', protect, getLeaveReport);
router.get('/students', protect, getStudentReport);
router.get('/movement', protect, getMovementReport);

// Analytical Details & Exports
router.get('/details', protect, getReportDetails);
router.get('/export', protect, exportReport);

module.exports = router;
