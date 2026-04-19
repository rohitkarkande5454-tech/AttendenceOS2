const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users/students?branch_id=
const getStudents = async (req, res) => {
  try {
    const { branch_id } = req.query;
    let query = `
      SELECT s.id, s.roll_no, s.branch_id, u.name, u.email, b.name as branch_name
      FROM students s
      JOIN users u ON u.id = s.user_id
      JOIN branches b ON b.id = s.branch_id
    `;
    const params = [];
    if (branch_id) { query += ' WHERE s.branch_id = ?'; params.push(branch_id); }
    query += ' ORDER BY s.roll_no';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/users/students
const addStudent = async (req, res) => {
  try {
    const { name, email, password, branch_id, roll_no } = req.body;
    const hash = await bcrypt.hash(password || 'student123', 10);
    const [r] = await db.query(
      'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      [name, email, hash, 'student']
    );
    await db.query(
      'INSERT INTO students (user_id,branch_id,roll_no) VALUES (?,?,?)',
      [r.insertId, branch_id, roll_no]
    );
    res.status(201).json({ message: 'Student added successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Email or Roll No already exists.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/users/students/:id
const deleteStudent = async (req, res) => {
  try {
    const [s] = await db.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    if (!s.length) return res.status(404).json({ message: 'Student not found.' });
    await db.query('DELETE FROM users WHERE id = ?', [s[0].user_id]);
    res.json({ message: 'Student deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/users/teachers
const getTeachers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, u.name, u.email, b.name as branch_name,
        GROUP_CONCAT(sub.name SEPARATOR ', ') as subjects,
        GROUP_CONCAT(sub.code SEPARATOR ', ') as codes
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN branches b ON b.id = t.branch_id
      LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
      LEFT JOIN subjects sub ON sub.id = ts.subject_id
      GROUP BY t.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/users/teachers
const addTeacher = async (req, res) => {
  try {
    const { name, email, password, branch_id, subject_ids } = req.body;
    const hash = await bcrypt.hash(password || 'teacher123', 10);
    const [r] = await db.query(
      'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      [name, email, hash, 'teacher']
    );
    const [t] = await db.query(
      'INSERT INTO teachers (user_id,branch_id) VALUES (?,?)',
      [r.insertId, branch_id]
    );
    if (subject_ids && subject_ids.length) {
      for (const sid of subject_ids) {
        await db.query('INSERT INTO teacher_subjects (teacher_id,subject_id) VALUES (?,?)', [t.insertId, sid]);
      }
    }
    res.status(201).json({ message: 'Teacher added successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Email already exists.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/users/branches
const getBranches = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM branches');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/users/branches
const addBranch = async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('INSERT INTO branches (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Branch added.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/users/subjects?branch_id=
const getSubjects = async (req, res) => {
  try {
    const { branch_id } = req.query;
    let q = 'SELECT s.*, b.name as branch_name FROM subjects s JOIN branches b ON b.id=s.branch_id';
    const p = [];
    if (branch_id) { q += ' WHERE s.branch_id=?'; p.push(branch_id); }
    const [rows] = await db.query(q, p);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/users/subjects
const addSubject = async (req, res) => {
  try {
    const { name, code, branch_id } = req.body;
    await db.query('INSERT INTO subjects (name,code,branch_id) VALUES (?,?,?)', [name, code, branch_id]);
    res.status(201).json({ message: 'Subject added.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getStudents, addStudent, deleteStudent, getTeachers, addTeacher, getBranches, addBranch, getSubjects, addSubject };
