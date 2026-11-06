const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/auth');

router.get('/daily', authMiddleware, attendanceController.getBatchDailyAttendance);
router.post('/save', authMiddleware, attendanceController.saveBatchAttendance);
router.get('/monthly-report', authMiddleware, attendanceController.getMonthlyReport);

module.exports = router;

