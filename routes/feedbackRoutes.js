const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitFeedback, getFeedbackList, updateFeedbackStatus } = require('../controllers/feedbackController');

// Secure all feedback actions
router.use(protect);

// POST /feedback - Submit a new feedback complaint
router.post('/', submitFeedback);

// GET /feedback - Retrieve student feedback complaints history
router.get('/', getFeedbackList);

// PUT /feedback/:id - Update feedback status
router.put('/:id', updateFeedbackStatus);

module.exports = router;
