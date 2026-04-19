import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = {
  admin: [
    { path: '/admin',           icon: '📊', label: 'Dashboard' },
    { path: '/admin/branches',  icon: '🏫', label: 'Branches & Subjects' },
    { path: '/admin/teachers',  icon: '👨‍🏫', label: 'Teachers' },
    { path: '/admin/students',  icon: '🎓', label: 'Students' },
    { path: '/admin/attendance',icon: '📋', label: 'Attendance Records' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
  ],
  teacher: [
    { path: '/teacher',         icon: '📊', label: 'Dashboard' },
    { path: '/teacher/mark',    icon: '✅', label: 'Mark Attendance' },
    { path: '/teacher/view',    icon: '👁️', label: 'View Attendance' },
    { path: '/teacher/students',icon: '🎓', label: 'My Students' },
  ],
  student: [
    { path: '/student',          icon: '📊', label: 'Dashboard' },
    { path: '/student/attendance',icon: '📋', label: 'My Attendance' },
    { path: '/student/analytics', icon: '📈', label: 'Analytics' },
  ],
};

const ROLE_COLOR = { admin:'#f97316', teacher:'#6c63ff', student:'#22c55e' };

export default function Sidebar({ open }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const color     = ROLE_COLOR[user?.role] || 'var(--accent)';
  const navItems  = NAV[user?.role] || [];

  const isActive = (path) =>
    path === `/${user?.role}`
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-row">
          <div className="logo-icon">A</div>
          <div>
            <div className="logo-name">Attendance <span>OS</span></div>
            <div className="logo-sub">v2.0 · Academic Suite</div>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="sidebar-user">
        <div className="user-chip">
          <div className="user-avatar" style={{ background:`${color}22`, color }}>
            {user?.name?.charAt(0)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="user-name-text">{user?.name}</div>
            <div className="user-role-text" style={{ color }}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {navItems.map(item => (
          <div key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}
