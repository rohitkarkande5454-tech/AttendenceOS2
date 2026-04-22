const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  getStudents, addStudent, deleteStudent,
  getTeachers, addTeacher, deleteTeacher,
  getBranches, addBranch,
  getSubjects, addSubject
} = require('../controllers/userController');

// Branches
router.get('/branches',          authMiddleware, getBranches);
router.post('/branches',         authMiddleware, requireRole('admin'), addBranch);

// Subjects
router.get('/subjects',          authMiddleware, getSubjects);
router.post('/subjects',         authMiddleware, requireRole('admin'), addSubject);

// Students
router.get('/students',          authMiddleware, getStudents);
router.post('/students',         authMiddleware, requireRole('admin'), addStudent);
router.delete('/students/:id',   authMiddleware, requireRole('admin'), deleteStudent);

// Teachers
router.get('/teachers',          authMiddleware, requireRole('admin'), getTeachers);
router.post('/teachers',         authMiddleware, requireRole('admin'), addTeacher);
router.delete('/teachers/:id',   authMiddleware, requireRole('admin'), deleteTeacher);

module.exports = router;
