const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

router.post('/login',    login);
router.post('/register', register);

// Temporary seed route - delete after use
router.get('/seed-passwords', async (req, res) => {
  try {
    const adminHash   = await bcrypt.hash('admin123',   10);
    const teacherHash = await bcrypt.hash('teacher123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    await db.query(`UPDATE users SET password=? WHERE role='admin'`,   [adminHash]);
    await db.query(`UPDATE users SET password=? WHERE role='teacher'`, [teacherHash]);
    await db.query(`UPDATE users SET password=? WHERE role='student'`, [studentHash]);

    res.json({ message: '✅ Passwords seeded! admin123 / teacher123 / student123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
