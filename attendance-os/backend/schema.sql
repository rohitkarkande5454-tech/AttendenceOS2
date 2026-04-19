-- =============================================
-- AttendanceOS v2.0 - MySQL Schema + Seed Data
-- Run this file in MySQL Workbench or CLI:
--   mysql -u root -p < schema.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS attendance_os;
USE attendance_os;

-- Drop tables if exist (for fresh setup)
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS teacher_subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','teacher','student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches Table
CREATE TABLE branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Subjects Table
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  branch_id INT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Teachers Table
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  branch_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Teacher-Subject Mapping
CREATE TABLE teacher_subjects (
  teacher_id INT,
  subject_id INT,
  PRIMARY KEY (teacher_id, subject_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Students Table
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  branch_id INT,
  roll_no VARCHAR(20) UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Attendance Table
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT,
  teacher_id INT,
  date DATE NOT NULL,
  status ENUM('present','absent') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, subject_id, date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- =============================================
-- SEED DATA
-- =============================================

-- Branches
INSERT INTO branches (name) VALUES 
  ('Computer Engineering'),
  ('Information Technology');

-- Subjects
INSERT INTO subjects (name, code, branch_id) VALUES
  ('Data Structures', 'CS301', 1),
  ('Operating Systems', 'CS302', 1),
  ('Database Management', 'CS303', 1),
  ('Web Technologies', 'IT301', 2),
  ('Computer Networks', 'IT302', 2),
  ('Software Engineering', 'IT303', 2);

-- Users (passwords are bcrypt hash of 'admin123', 'teacher123', 'student123')
-- Using plain text here; backend will hash on register
-- For direct DB insert, use these bcrypt hashes:
INSERT INTO users (name, email, password, role) VALUES
  ('Dr. Admin Kumar',      'admin@college.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('Prof. Rahul Sharma',   'rahul@college.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher'),
  ('Prof. Priya Patel',    'priya@college.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher'),
  ('Arjun Mehta',          'arjun@student.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Sneha Joshi',          'sneha@student.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Rohan Gupta',          'rohan@student.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Pooja Singh',          'pooja@student.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Karan Shah',           'karan@student.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Ananya Roy',           'ananya@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Vikram Jain',          'vikram@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Riya Desai',           'riya@student.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Amit Kumar',           'amit@student.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('Neha Verma',           'neha@student.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

-- Note: All passwords above = 'password' (bcrypt hash)
-- After running schema.sql, run: node backend/seedPassword.js
-- to set correct passwords (admin123, teacher123, student123)

-- Teachers
INSERT INTO teachers (user_id, branch_id) VALUES (2, 1), (3, 2);

-- Teacher-Subject mapping
INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
  (1, 1), (1, 2), (1, 3),
  (2, 4), (2, 5), (2, 6);

-- Students
INSERT INTO students (user_id, branch_id, roll_no) VALUES
  (4,  1, 'CE2101'),
  (5,  1, 'CE2102'),
  (6,  1, 'CE2103'),
  (7,  1, 'CE2104'),
  (8,  1, 'CE2105'),
  (9,  2, 'IT2101'),
  (10, 2, 'IT2102'),
  (11, 2, 'IT2103'),
  (12, 2, 'IT2104'),
  (13, 2, 'IT2105');

-- Attendance Records (last 10 days sample)
INSERT INTO attendance (student_id, subject_id, teacher_id, date, status) VALUES
  (1,1,1,CURDATE() - INTERVAL 1 DAY,'present'),
  (1,1,1,CURDATE() - INTERVAL 2 DAY,'present'),
  (1,1,1,CURDATE() - INTERVAL 3 DAY,'absent'),
  (1,2,1,CURDATE() - INTERVAL 1 DAY,'present'),
  (1,3,1,CURDATE() - INTERVAL 1 DAY,'present'),
  (2,1,1,CURDATE() - INTERVAL 1 DAY,'absent'),
  (2,2,1,CURDATE() - INTERVAL 1 DAY,'present'),
  (3,1,1,CURDATE() - INTERVAL 1 DAY,'present'),
  (4,1,1,CURDATE() - INTERVAL 1 DAY,'present'),
  (5,1,1,CURDATE() - INTERVAL 1 DAY,'absent'),
  (6,4,2,CURDATE() - INTERVAL 1 DAY,'present'),
  (7,5,2,CURDATE() - INTERVAL 1 DAY,'present'),
  (8,6,2,CURDATE() - INTERVAL 1 DAY,'absent'),
  (9,4,2,CURDATE() - INTERVAL 1 DAY,'present'),
  (10,5,2,CURDATE() - INTERVAL 1 DAY,'present');
