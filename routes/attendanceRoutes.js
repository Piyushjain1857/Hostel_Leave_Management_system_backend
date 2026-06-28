const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAttendance);
router.post('/', attendanceController.addAttendance);
router.get('/report', attendanceController.getAttendanceReport);

module.exports = router;
