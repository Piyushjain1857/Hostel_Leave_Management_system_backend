const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginStudent,
    verifyOTP,
    resendOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword 
} = require('../controllers/authController');

// Registration and OTP Verification
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Forgot Password Flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Login (Student)
router.post('/login', loginStudent);

module.exports = router;
