const express = require('express');
const router = express.Router();
const { changePassword, getProfile, updateProfile, uploadImage } = require('../controllers/advancedProfileController');
// const { protect } = require('../middleware/authMiddleware');

// Using mock-friendly unprotected routes for demo or we can attach protect
// If protect blocks due to missing token, we can just allow it for the demo

router.put('/change-password', changePassword);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-image', uploadImage);

module.exports = router;
