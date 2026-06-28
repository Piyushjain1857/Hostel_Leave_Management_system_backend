const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getGateLogs, getGateLogById } = require('../controllers/gateLogsController');

// Guard all gate logs endpoints with session validation
router.get('/', protect, getGateLogs);
router.get('/:id', protect, getGateLogById);

module.exports = router;
