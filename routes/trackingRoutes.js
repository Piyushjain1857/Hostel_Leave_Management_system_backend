const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getStudentTrackingLogs, getStudentTrackingLogsById } = require('../controllers/trackingController');

// Guard tracking routes
router.use(protect);

// GET /tracking/students - Fetch all tracking logs
router.get('/students', getStudentTrackingLogs);

// GET /tracking/student/:id - Fetch logs for specific student
router.get('/student/:id', getStudentTrackingLogsById);

module.exports = router;
