const express = require('express');
const router = express.Router();
const { changePassword, getProfile, updateProfile, uploadImage } = require('../controllers/advancedProfileController');
const { protect } = require('../middleware/authMiddleware');

router.put('/change-password', protect, changePassword);
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/upload-image', protect, uploadImage);

module.exports = router;
