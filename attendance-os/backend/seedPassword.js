// Run this after schema.sql: node seedPassword.js
const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seedPasswords() {
  try {
    const adminHash    = await bcrypt.hash('admin123',   10);
    const teacherHash  = await bcrypt.hash('teacher123', 10);
    const studentHash  = await bcrypt.hash('student123', 10);

    await db.query(`UPDATE users SET password=? WHERE role='admin'`,   [adminHash]);
    await db.query(`UPDATE users SET password=? WHERE role='teacher'`, [teacherHash]);
    await db.query(`UPDATE users SET password=? WHERE role='student'`, [studentHash]);

    console.log('✅ Passwords seeded successfully!');
    console.log('   Admin:   admin@college.edu   / admin123');
    console.log('   Teacher: rahul@college.edu   / teacher123');
    console.log('   Student: arjun@student.edu   / student123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding passwords:', err);
    process.exit(1);
  }
}

seedPasswords();
