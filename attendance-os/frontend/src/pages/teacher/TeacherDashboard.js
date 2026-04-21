import React, { useEffect, useState } from 'react';
import axios from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user }  = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (user?.branch_id) {
      axios.get(`/api/users/students?branch_id=${user.branch_id}`).then(r => setStudents(r.data));
    }
    if (user?.subject_ids?.length) {
      axios.get(`/api/users/subjects?branch_id=${user.branch_id}`).then(r => setSubjects(r.data));
    }
  }, [user]);

  return (
    <div>
      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🏫</div>
          <div className="stat-label">My Branch</div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:800, color:'var(--accent)', marginTop:8 }}>
            {user?.branch_name || '—'}
          </div>
          <div className="stat-sub">Assigned branch</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🎓</div>
          <div className="stat-label">My Students</div>
          <div className="stat-val green">{students.length}</div>
          <div className="stat-sub">In {user?.branch_name}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📚</div>
          <div className="stat-label">Subjects</div>
          <div className="stat-val purple">{subjects.length}</div>
          <div className="stat-sub">Assigned to you</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Today's Date</div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:800, color:'var(--orange)', marginTop:8 }}>
            {new Date().toLocaleDateString('en-IN',{ day:'2-digit', month:'short' })}
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      {subjects.length > 0 && (
        <div className="section-card">
          <div className="section-title" style={{ marginBottom:16 }}>📚 My Subjects</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:12 }}>
            {subjects.map(s => (
              <div key={s.id} className="subject-card">
                <div className="subject-name">{s.name}</div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginBottom:8 }}>
                  <span>{s.code}</span>
                  <span>{s.branch_name}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:'75%', background:'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick student list */}
      <div className="section-card">
        <div className="section-title" style={{ marginBottom:14 }}>🎓 Students in My Branch</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Roll No.</th><th>Name</th><th>Email</th></tr></thead>
            <tbody>
              {students.slice(0,8).map(s => (
                <tr key={s.id}>
                  <td><span className="badge info">{s.roll_no}</span></td>
                  <td style={{ fontWeight:600 }}>{s.name}</td>
                  <td style={{ color:'var(--text3)' }}>{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
