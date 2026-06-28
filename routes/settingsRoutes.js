const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// Open GET for student portal context, protect updates
router.get('/', getSettings);
router.put('/', protect, updateSettings);

module.exports = router;
