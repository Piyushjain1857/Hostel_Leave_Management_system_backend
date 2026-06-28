const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  loginWarden,
  getWardenDashboard,
  getWardenPending,
  getWardenProfile,
  updateWardenProfile,
  changeWardenPassword,
  approveLeave,
  rejectLeave
} = require('../controllers/wardenController');

// POST /warden/login - Warden login
router.post('/login', loginWarden);

// Protected routes
router.use(protect);

// GET /warden/dashboard - Fetch dashboard metrics & statistics
router.get('/dashboard', getWardenDashboard);

// GET /warden/pending - Fetch pending leaves list
router.get('/pending', getWardenPending);

// Warden Profile & Approvals routes
router.get('/profile', getWardenProfile);
router.put('/profile', updateWardenProfile);
router.put('/change-password', changeWardenPassword);
router.put('/approve/:id', approveLeave);
router.put('/reject/:id', rejectLeave);

module.exports = router;
