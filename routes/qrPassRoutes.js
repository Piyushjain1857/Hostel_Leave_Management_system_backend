const express = require('express');
const router = express.Router();
const { getQRHistory, regenerateQR, downloadQR } = require('../controllers/qrPassController');

router.get('/history', getQRHistory);
router.post('/regenerate/:id', regenerateQR);
router.get('/download/:id', downloadQR);

module.exports = router;
