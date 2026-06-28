const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  applyLeave,
  getLeaveHistory,
  getLeaveById,
  generateQR
} = require('../controllers/leaveController');

// All leave paths are secured
router.use(protect);

// POST /leave/apply - Submit a leave request
router.post('/apply', applyLeave);

// GET /leave/history - Fetch student's leave request history
router.get('/history', getLeaveHistory);

// POST /leave/generate-qr - Generate a QR code pass URL
router.post('/generate-qr', generateQR);

// GET /leave/:id - Fetch details of a specific leave request
router.get('/:id', getLeaveById);

module.exports = router;
