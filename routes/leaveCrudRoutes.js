const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave
} = require('../controllers/leaveCrudController');

// All endpoints require session authentication
router.get('/', protect, getLeaves);
router.get('/:id', protect, getLeaveById);
router.put('/:id', protect, updateLeave);
router.delete('/:id', protect, deleteLeave);

module.exports = router;
