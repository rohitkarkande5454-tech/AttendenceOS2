# 🎓 AttendanceOS v2.0 — Academic Suite
### Full-Stack Attendance Management System
> React.js + Node.js + MySQL + Gemini AI

---

## 📁 Project Structure

```
attendance-os/
├── backend/                  ← Node.js + Express API
│   ├── server.js
│   ├── .env
│   ├── schema.sql            ← MySQL database setup
│   ├── seedPassword.js       ← Set correct passwords
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── attendanceController.js
│   │   └── userController.js
│   └── routes/
│       ├── auth.js
│       ├── attendance.js
│       └── users.js
└── frontend/                 ← React.js App
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/AuthContext.js
        ├── components/
        │   ├── Sidebar.js
        │   ├── Topbar.js
        │   └── AiChat.js
        └── pages/
            ├── LoginPage.js
            ├── admin/         ← Admin pages
            ├── teacher/       ← Teacher pages
            └── student/       ← Student pages
```

---

## ⚙️ Prerequisites (Install These First)

| Tool | Download |
|------|----------|
| Node.js (v18+) | https://nodejs.org |
| MySQL (v8+) | https://dev.mysql.com/downloads/ |
| Git (optional) | https://git-scm.com |

---

## 🚀 STEP-BY-STEP SETUP

---

### STEP 1 — MySQL Database Setup

Open **MySQL Workbench** or **MySQL Command Line** and run:

```bash
mysql -u root -p < backend/schema.sql
```

OR copy-paste the content of `backend/schema.sql` into MySQL Workbench and click ▶ Run.

This creates:
- Database: `attendance_os`
- All tables (users, branches, subjects, teachers, students, attendance)
- Sample data (2 branches, 6 subjects, 2 teachers, 10 students)

---

### STEP 2 — Backend Setup

Open terminal, go into the backend folder:

```bash
cd backend
npm install
```

**Edit the `.env` file** — open it in Notepad or VS Code:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE   ← change this
DB_NAME=attendance_os
JWT_SECRET=attendance_os_super_secret_key_2024
PORT=5000
```

Now set correct passwords in the database:

```bash
node seedPassword.js
```

You should see:
```
✅ Passwords seeded successfully!
   Admin:   admin@college.edu   / admin123
   Teacher: rahul@college.edu   / teacher123
   Student: arjun@student.edu   / student123
```

Start the backend server:

```bash
npm run dev
```

You should see:
```
🚀 Backend server running on http://localhost:5000
```

Test it: Open browser → http://localhost:5000
You should see: `✅ AttendanceOS API running!`

---

### STEP 3 — Frontend Setup

Open a **NEW terminal window**, go into frontend folder:

```bash
cd frontend
npm install
npm start
```

Browser will automatically open: **http://localhost:3000**

---

## 🔑 Login Credentials

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@college.edu      | admin123     |
| Teacher | rahul@college.edu      | teacher123   |
| Teacher | priya@college.edu      | teacher123   |
| Student | arjun@student.edu      | student123   |
| Student | sneha@student.edu      | student123   |
| Student | rohan@student.edu      | student123   |

---

## 🌐 API Endpoints

### Auth
```
POST /api/auth/login        ← Login
POST /api/auth/register     ← Register new user
```

### Attendance
```
POST /api/attendance/mark                   ← Mark attendance (Teacher)
GET  /api/attendance?subject_id=&date=      ← Get records (filtered)
GET  /api/attendance/my                     ← Student's own attendance
GET  /api/attendance/summary/:studentId     ← Subject-wise summary
GET  /api/attendance/analytics              ← Admin analytics
```

### Users / Admin
```
GET  /api/users/students?branch_id=   ← Get students
POST /api/users/students              ← Add student
DEL  /api/users/students/:id          ← Delete student
GET  /api/users/teachers              ← Get teachers
POST /api/users/teachers              ← Add teacher
GET  /api/users/branches              ← Get branches
POST /api/users/branches              ← Add branch
GET  /api/users/subjects?branch_id=   ← Get subjects
POST /api/users/subjects              ← Add subject
```

---

## 🗄️ Database Tables

```sql
users        → id, name, email, password, role
branches     → id, name
subjects     → id, name, code, branch_id
teachers     → id, user_id, branch_id
teacher_subjects → teacher_id, subject_id
students     → id, user_id, branch_id, roll_no
attendance   → id, student_id, subject_id, teacher_id, date, status
```

---

## ✅ Features

### Admin
- Dashboard with charts (Line, Bar, Doughnut)
- Manage branches and subjects
- Add/delete teachers and students
- View all attendance records with filters
- Export attendance to CSV
- Analytics — branch-wise, subject-wise, students below 75%

### Teacher
- Dashboard with subject overview
- Mark attendance (Present/Absent toggle per student)
- Bulk mark all present / all absent
- View attendance summary per subject
- View student list

### Student
- Dashboard with overall attendance %
- Subject-wise progress bars
- Attendance history with filters
- Analytics — trend chart, present vs absent chart
- Export personal attendance to CSV

### AI Assistant (Gemini)
- Floating chat button (bottom-right)
- Answers attendance queries
- Quick-question shortcuts
- Context-aware (knows user role)

---

## ❗ Common Issues & Fixes

**"Cannot connect to MySQL"**
→ Check DB_PASSWORD in `.env` file
→ Make sure MySQL service is running

**"Module not found"**
→ Run `npm install` again in both frontend and backend folders

**Frontend shows blank page**
→ Make sure backend is running on port 5000
→ Check browser console for errors

**"Invalid token" error**
→ Clear localStorage: Open browser DevTools → Application → Local Storage → Clear

---

## 👨‍💻 Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Frontend | React.js 18       |
| Routing  | React Router v6   |
| Charts   | Chart.js + react-chartjs-2 |
| Backend  | Node.js + Express |
| Database | MySQL 8           |
| Auth     | JWT + bcryptjs    |
| AI       | Google Gemini API |
| Styling  | Custom CSS        |

---

*AttendanceOS v2.0 — Sem 4 Mini Project*
