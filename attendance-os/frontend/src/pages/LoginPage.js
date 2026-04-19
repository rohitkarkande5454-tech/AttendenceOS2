import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DEMOS = {
  admin:   { email: 'admin@college.edu',  password: 'admin123' },
  teacher: { email: 'rahul@college.edu',  password: 'teacher123' },
  student: { email: 'arjun@student.edu',  password: 'student123' },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [role,     setRole]     = useState('admin');
  const [email,    setEmail]    = useState('admin@college.edu');
  const [password, setPassword] = useState('admin123');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const pickRole = (r) => {
    setRole(r);
    setEmail(DEMOS[r].email);
    setPassword(DEMOS[r].password);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-card">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
          <div className="logo-icon" style={{ width:48, height:48, fontSize:22 }}>A</div>
          <div>
            <div style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:800 }}>
              Attendance <span style={{ color:'var(--accent)' }}>OS</span>
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>v2.0 · Academic Suite</div>
          </div>
        </div>

        <div className="login-title">Welcome Back 👋</div>
        <div className="login-sub">Sign in to access your dashboard</div>

        {/* Role Tabs */}
        <div className="role-tabs">
          {['admin','teacher','student'].map(r => (
            <button key={r} className={`role-tab ${role === r ? 'active' : ''}`} onClick={() => pickRole(r)}>
              {r === 'admin' ? '⚙️' : r === 'teacher' ? '👨‍🏫' : '🎓'} {r.charAt(0).toUpperCase()+r.slice(1)}
            </button>
          ))}
        </div>

        {/* Demo credentials hint */}
        <div className="demo-box">
          <strong>🔑 Demo Credentials (auto-filled)</strong>
          <div className="demo-item">Admin:   admin@college.edu / admin123</div>
          <div className="demo-item">Teacher: rahul@college.edu / teacher123</div>
          <div className="demo-item">Student: arjun@student.edu / student123</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>

          {error && <div className="err-msg">{error}</div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}
            style={{ marginTop:6, padding:'13px', fontSize:15 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
