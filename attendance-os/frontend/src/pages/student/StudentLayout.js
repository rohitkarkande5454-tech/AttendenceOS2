import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar  from '../../components/Topbar';
import AiChat  from '../../components/AiChat';
import StudentDashboard  from './StudentDashboard';
import StudentAttendance from './StudentAttendance';
import StudentAnalytics  from './StudentAnalytics';

const TITLES = { '':'Dashboard', 'attendance':'My Attendance', 'analytics':'Analytics' };

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const seg = window.location.pathname.split('/student/')[1] || '';

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} />
      )}
      <Sidebar open={sidebarOpen} />
      <div className="main-area">
        <Topbar title={TITLES[seg] || 'Student'} onHamburger={() => setSidebarOpen(o => !o)} />
        <div className="page-content">
          <Routes>
            <Route index              element={<StudentDashboard />} />
            <Route path="attendance"  element={<StudentAttendance />} />
            <Route path="analytics"   element={<StudentAnalytics />} />
            <Route path="*"           element={<Navigate to="/student" replace />} />
          </Routes>
        </div>
      </div>
      <AiChat />
    </div>
  );
}
