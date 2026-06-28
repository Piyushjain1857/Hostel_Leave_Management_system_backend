const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');

router.get('/', auditLogController.getLogs);
router.get('/export', auditLogController.exportLogs);

module.exports = router;
