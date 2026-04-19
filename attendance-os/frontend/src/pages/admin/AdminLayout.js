import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar   from '../../components/Sidebar';
import Topbar    from '../../components/Topbar';
import AiChat    from '../../components/AiChat';
import AdminDashboard  from './AdminDashboard';
import AdminBranches   from './AdminBranches';
import AdminTeachers   from './AdminTeachers';
import AdminStudents   from './AdminStudents';
import AdminAttendance from './AdminAttendance';
import AdminAnalytics  from './AdminAnalytics';

const TITLES = {
  '':           'Dashboard',
  'branches':   'Branches & Subjects',
  'teachers':   'Teachers',
  'students':   'Students',
  'attendance': 'Attendance Records',
  'analytics':  'Analytics',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const seg = window.location.pathname.split('/admin/')[1] || '';

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} />
      )}
      <Sidebar open={sidebarOpen} />
      <div className="main-area">
        <Topbar title={TITLES[seg] || 'Admin'} onHamburger={() => setSidebarOpen(o => !o)} />
        <div className="page-content">
          <Routes>
            <Route index           element={<AdminDashboard />} />
            <Route path="branches" element={<AdminBranches />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="analytics"  element={<AdminAnalytics />} />
            <Route path="*"        element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
      <AiChat />
    </div>
  );
}
