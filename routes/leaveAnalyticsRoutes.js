const express = require('express');
const router = express.Router();
const leaveAnalyticsController = require('../controllers/leaveAnalyticsController');

router.get('/', leaveAnalyticsController.getAnalytics);
router.get('/reports', leaveAnalyticsController.getReports);

module.exports = router;
