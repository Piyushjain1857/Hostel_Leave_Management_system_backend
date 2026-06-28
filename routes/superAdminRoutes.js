const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

router.get('/dashboard', superAdminController.getDashboard);
router.get('/system-health', superAdminController.getSystemHealth);
router.post('/database/backup', superAdminController.backupDatabase);
router.get('/system-statistics', superAdminController.getSystemStatistics);

module.exports = router;
