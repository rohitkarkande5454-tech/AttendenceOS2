import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar  from '../../components/Topbar';
import AiChat  from '../../components/AiChat';
import TeacherDashboard from './TeacherDashboard';
import MarkAttendance   from './MarkAttendance';
import ViewAttendance   from './ViewAttendance';
import TeacherStudents  from './TeacherStudents';

const TITLES = { '':'Dashboard', 'mark':'Mark Attendance', 'view':'View Attendance', 'students':'My Students' };

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const seg = window.location.pathname.split('/teacher/')[1] || '';

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} />
      )}
      <Sidebar open={sidebarOpen} />
      <div className="main-area">
        <Topbar title={TITLES[seg] || 'Teacher'} onHamburger={() => setSidebarOpen(o => !o)} />
        <div className="page-content">
          <Routes>
            <Route index           element={<TeacherDashboard />} />
            <Route path="mark"     element={<MarkAttendance />} />
            <Route path="view"     element={<ViewAttendance />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="*"        element={<Navigate to="/teacher" replace />} />
          </Routes>
        </div>
      </div>
      <AiChat />
    </div>
  );
}
