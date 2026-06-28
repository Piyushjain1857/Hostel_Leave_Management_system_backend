const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  loginParent,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getParentProfile,
  updateParentProfile,
  changeParentPassword,
  getParentLeaveHistory
} = require('../controllers/parentController');

// POST /parent/login - Parent login
router.post('/login', loginParent);

// Protected routes (require valid JWT)
router.use(protect);

// GET /parent/pending - Fetch all pending leave applications
router.get('/pending', getPendingLeaves);

// PUT /parent/approve/:id - Parent approves a leave request
router.put('/approve/:id', approveLeave);

// PUT /parent/reject/:id - Parent rejects a leave request
router.put('/reject/:id', rejectLeave);

// Parent Profile & History routes
router.get('/profile', getParentProfile);
router.put('/profile', updateParentProfile);
router.put('/change-password', changeParentPassword);
router.get('/leave-history', getParentLeaveHistory);

module.exports = router;
