import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function MarkAttendance() {
  const { user }   = useAuth();
  const [students, setStudents]  = useState([]);
  const [subjects, setSubjects]  = useState([]);
  const [selSub,   setSelSub]    = useState('');
  const [date,     setDate]      = useState(new Date().toISOString().split('T')[0]);
  const [attMap,   setAttMap]    = useState({});  // { student_id: 'present'|'absent' }
  const [search,   setSearch]    = useState('');
  const [saving,   setSaving]    = useState(false);

  useEffect(() => {
    if (user?.branch_id) {
      axios.get(`/api/users/students?branch_id=${user.branch_id}`).then(r => {
        setStudents(r.data);
        const init = {};
        r.data.forEach(s => { init[s.id] = 'present'; });
        setAttMap(init);
      });
      axios.get(`/api/users/subjects?branch_id=${user.branch_id}`).then(r => {
        setSubjects(r.data);
        if (r.data.length) setSelSub(String(r.data[0].id));
      });
    }
  }, [user]);

  // Load existing attendance when subject/date changes
  useEffect(() => {
    if (!selSub || !date) return;
    axios.get('/api/attendance', { params:{ subject_id:selSub, date } }).then(r => {
      if (r.data.length) {
        const existing = {};
        r.data.forEach(a => { existing[a.student_id] = a.status; });
        setAttMap(prev => {
          const merged = { ...prev };
          Object.keys(existing).forEach(k => { merged[k] = existing[k]; });
          return merged;
        });
      }
    });
  }, [selSub, date]);

  const toggle = (sid, status) => setAttMap(m => ({ ...m, [sid]: status }));

  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s.id] = status; });
    setAttMap(all);
  };

  const save = async () => {
    if (!selSub) { toast.error('Select a subject first'); return; }
    setSaving(true);
    try {
      const records = students.map(s => ({ student_id: s.id, status: attMap[s.id] || 'present' }));
      await axios.post('/api/attendance/mark', { subject_id: parseInt(selSub), date, records });
      toast.success(`✅ Attendance saved for ${records.length} students!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
             || s.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = Object.values(attMap).filter(v => v === 'present').length;
  const absentCount  = Object.values(attMap).filter(v => v === 'absent').length;
  const pct          = students.length ? Math.round(presentCount / students.length * 100) : 0;

  return (
    <div>
      {/* Quick Stats */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Students</div>
          <div className="stat-val blue">{students.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Present Today</div>
          <div className="stat-val green">{presentCount}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">❌</div>
          <div className="stat-label">Absent Today</div>
          <div className="stat-val red">{absentCount}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Today's %</div>
          <div className="stat-val orange">{pct}%</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title" style={{ marginBottom:18 }}>✅ Mark Attendance</div>

        {/* Filters */}
        <div className="form-row-3" style={{ marginBottom:16 }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Subject</label>
            <select className="form-select" value={selSub} onChange={e => setSelSub(e.target.value)}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Search Student</label>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" style={{ width:'100%' }} placeholder="Name or roll..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          <button className="btn btn-success btn-sm" onClick={() => markAll('present')}>✅ Mark All Present</button>
          <button className="btn btn-danger  btn-sm" onClick={() => markAll('absent')} >❌ Mark All Absent</button>
        </div>

        {/* Student List */}
        <div style={{ maxHeight:420, overflowY:'auto' }}>
          {filtered.map(s => (
            <div key={s.id} className="att-row">
              <div className="att-avatar">{s.name?.charAt(0)}</div>
              <div style={{ flex:1 }}>
                <div className="att-name">{s.name}</div>
                <div className="att-roll">{s.roll_no}</div>
              </div>
              <div className="att-btns">
                <button className={`att-btn p ${attMap[s.id]==='present'?'sel':''}`}
                  onClick={() => toggle(s.id,'present')}>P</button>
                <button className={`att-btn a ${attMap[s.id]==='absent'?'sel':''}`}
                  onClick={() => toggle(s.id,'absent')}>A</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:30, color:'var(--text3)' }}>No students found.</div>
          )}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}
