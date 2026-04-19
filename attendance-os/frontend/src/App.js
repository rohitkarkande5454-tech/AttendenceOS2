import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage    from './pages/LoginPage';
import AdminLayout  from './pages/admin/AdminLayout';
import TeacherLayout from './pages/teacher/TeacherLayout';
import StudentLayout from './pages/student/StudentLayout';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#4f8ef7',fontSize:18 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />
      <Route path="/admin/*"   element={<PrivateRoute role="admin">  <AdminLayout />  </PrivateRoute>} />
      <Route path="/teacher/*" element={<PrivateRoute role="teacher"><TeacherLayout /></PrivateRoute>} />
      <Route path="/student/*" element={<PrivateRoute role="student"><StudentLayout /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
