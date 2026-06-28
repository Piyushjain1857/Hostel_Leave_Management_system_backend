const express = require('express');
const router = express.Router();
const { 
  getActiveLeaves, getActiveLeavesStats, 
  getApprovedAnalytics, getRejectedLeaves, getRejectedAnalytics 
} = require('../controllers/advancedLeavesController');

router.get('/active', getActiveLeaves);
router.get('/active/stats', getActiveLeavesStats);
router.get('/approved/analytics', getApprovedAnalytics);
router.get('/rejected', getRejectedLeaves);
router.get('/rejected/analytics', getRejectedAnalytics);

module.exports = router;
