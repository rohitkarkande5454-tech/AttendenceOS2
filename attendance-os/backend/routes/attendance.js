const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  markAttendance, getAttendance,
  getStudentAttendance, getStudentSummary, getAnalytics
} = require('../controllers/attendanceController');

router.post('/mark',           authMiddleware, requireRole('teacher','admin'), markAttendance);
router.get('/',                authMiddleware, getAttendance);
router.get('/my',              authMiddleware, requireRole('student'), getStudentAttendance);
router.get('/summary/:studentId', authMiddleware, getStudentSummary);
router.get('/analytics',       authMiddleware, requireRole('admin'), getAnalytics);

module.exports = router;
