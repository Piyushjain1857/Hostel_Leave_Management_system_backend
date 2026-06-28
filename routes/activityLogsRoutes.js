const express = require('express');
const router = express.Router();
const { getActivityLogs, exportActivityLogs } = require('../controllers/activityLogsController');

router.get('/', getActivityLogs);
router.get('/export', exportActivityLogs);

module.exports = router;
