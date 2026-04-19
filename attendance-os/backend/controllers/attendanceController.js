const db = require('../config/db');

// POST /api/attendance/mark  (Teacher)
const markAttendance = async (req, res) => {
  try {
    const { subject_id, date, records } = req.body;
    // records = [{ student_id, status }]
    const teacher = await getTeacherByUserId(req.user.id);
    if (!teacher) return res.status(403).json({ message: 'Teacher not found.' });

    for (const r of records) {
      await db.query(
        `INSERT INTO attendance (student_id, subject_id, teacher_id, date, status)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE status=?, teacher_id=?`,
        [r.student_id, subject_id, teacher.id, date, r.status, r.status, teacher.id]
      );
    }
    res.json({ message: `Attendance saved for ${records.length} students.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/attendance?subject_id=&date= (Teacher - view by subject+date)
const getAttendance = async (req, res) => {
  try {
    const { subject_id, date, branch_id } = req.query;
    let query = `
      SELECT a.*, u.name as student_name, s.roll_no, sub.name as subject_name, sub.code
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      JOIN users u ON u.id = s.user_id
      JOIN subjects sub ON sub.id = a.subject_id
      WHERE 1=1
    `;
    const params = [];
    if (subject_id) { query += ' AND a.subject_id = ?'; params.push(subject_id); }
    if (date)       { query += ' AND a.date = ?';       params.push(date); }
    if (branch_id)  { query += ' AND s.branch_id = ?';  params.push(branch_id); }
    query += ' ORDER BY a.date DESC, u.name ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/attendance/student/:id  (Student's own attendance)
const getStudentAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const [student] = await db.query('SELECT * FROM students WHERE user_id = ?', [userId]);
    if (!student.length) return res.status(404).json({ message: 'Student not found.' });

    const [rows] = await db.query(
      `SELECT a.date, a.status, sub.name as subject_name, sub.code, sub.id as subject_id
       FROM attendance a
       JOIN subjects sub ON sub.id = a.subject_id
       WHERE a.student_id = ?
       ORDER BY a.date DESC`,
      [student[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/attendance/summary/:studentId
const getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await db.query(
      `SELECT sub.id, sub.name, sub.code,
        COUNT(*) as total,
        SUM(a.status='present') as present,
        ROUND(SUM(a.status='present')/COUNT(*)*100, 1) as percentage
       FROM attendance a
       JOIN subjects sub ON sub.id = a.subject_id
       WHERE a.student_id = ?
       GROUP BY sub.id`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/attendance/analytics  (Admin)
const getAnalytics = async (req, res) => {
  try {
    // Overall
    const [[overall]] = await db.query(
      `SELECT COUNT(*) as total, SUM(status='present') as present FROM attendance`
    );
    // Branch-wise
    const [branchStats] = await db.query(
      `SELECT b.id, b.name,
        COUNT(a.id) as total,
        SUM(a.status='present') as present,
        ROUND(SUM(a.status='present')/COUNT(a.id)*100,1) as percentage
       FROM branches b
       LEFT JOIN students s ON s.branch_id = b.id
       LEFT JOIN attendance a ON a.student_id = s.id
       GROUP BY b.id`
    );
    // Subject-wise
    const [subjectStats] = await db.query(
      `SELECT sub.id, sub.name, sub.code, b.name as branch_name,
        COUNT(a.id) as total,
        SUM(a.status='present') as present,
        ROUND(SUM(a.status='present')/COUNT(a.id)*100,1) as percentage
       FROM subjects sub
       LEFT JOIN attendance a ON a.subject_id = sub.id
       LEFT JOIN branches b ON b.id = sub.branch_id
       GROUP BY sub.id`
    );
    // Students below 75%
    const [lowAttendance] = await db.query(
      `SELECT u.name, s.roll_no, b.name as branch_name,
        ROUND(SUM(a.status='present')/COUNT(a.id)*100,1) as percentage
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN branches b ON b.id = s.branch_id
       LEFT JOIN attendance a ON a.student_id = s.id
       GROUP BY s.id
       HAVING percentage < 75
       ORDER BY percentage ASC`
    );

    res.json({
      overall: {
        total: overall.total,
        present: overall.present,
        percentage: overall.total ? Math.round(overall.present / overall.total * 100) : 0
      },
      branchStats,
      subjectStats,
      lowAttendance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

async function getTeacherByUserId(userId) {
  const [rows] = await db.query('SELECT * FROM teachers WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

module.exports = { markAttendance, getAttendance, getStudentAttendance, getStudentSummary, getAnalytics };
