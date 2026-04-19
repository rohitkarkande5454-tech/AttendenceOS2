const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required.' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get extra info based on role
    let extra = {};
    if (user.role === 'teacher') {
      const [t] = await db.query(
        `SELECT t.id, t.branch_id, b.name as branch_name,
          GROUP_CONCAT(ts.subject_id) as subject_ids
         FROM teachers t
         LEFT JOIN branches b ON b.id = t.branch_id
         LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
         WHERE t.user_id = ?
         GROUP BY t.id`, [user.id]
      );
      extra = t[0] || {};
      extra.subject_ids = extra.subject_ids ? extra.subject_ids.split(',').map(Number) : [];
    }
    if (user.role === 'student') {
      const [s] = await db.query(
        `SELECT s.id as student_id, s.roll_no, s.branch_id, b.name as branch_name
         FROM students s
         LEFT JOIN branches b ON b.id = s.branch_id
         WHERE s.user_id = ?`, [user.id]
      );
      extra = s[0] || {};
    }

    res.json({
      token,
      user: {
        id: user.id, name: user.name,
        email: user.email, role: user.role,
        ...extra
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, branch_id, roll_no } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields required.' });

    const [exists] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0)
      return res.status(409).json({ message: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hash, role]
    );
    const userId = result.insertId;

    if (role === 'student') {
      await db.query(
        'INSERT INTO students (user_id, branch_id, roll_no) VALUES (?,?,?)',
        [userId, branch_id, roll_no]
      );
    }
    if (role === 'teacher') {
      await db.query(
        'INSERT INTO teachers (user_id, branch_id) VALUES (?,?)',
        [userId, branch_id]
      );
    }

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { login, register };
