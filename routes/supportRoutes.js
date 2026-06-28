const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { raiseSupportTicket, getSupportTickets } = require('../controllers/supportController');

// Secure all support routes
router.use(protect);

// POST /support/ticket - Raise a support ticket
router.post('/ticket', raiseSupportTicket);

// GET /support/tickets - View raised tickets history
router.get('/tickets', getSupportTickets);

module.exports = router;
