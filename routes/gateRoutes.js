const express = require('express');
const router = express.Router();
const {
  verifyQR,
  logExit,
  logReturn
} = require('../controllers/gateController');

// QR Verification Scanner Endpoint
router.post('/verify', verifyQR);

// Record Exit event
router.post('/exit', logExit);

// Record Return event
router.post('/return', logReturn);

module.exports = router;
