import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export function ViewAttendance() {
  const { user }   = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selSub,   setSelSub]   = useState('');
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (user?.branch_id) {
      axios.get(`/api/users/students?branch_id=${user.branch_id}`).then(r => setStudents(r.data));
      axios.get(`/api/users/subjects?branch_id=${user.branch_id}`).then(r => {
        setSubjects(r.data);
        if (r.data.length) setSelSub(String(r.data[0].id));
      });
    }
  }, [user]);

  useEffect(() => {
    if (!selSub) return;
    setLoading(true);
    axios.get('/api/attendance', { params:{ subject_id:selSub } })
      .then(r => setRecords(r.data))
      .finally(() => setLoading(false));
  }, [selSub]);

  // Summarize per student for selected subject
  const summary = students.map(s => {
    const recs    = records.filter(r => r.student_id === s.id);
    const present = recs.filter(r => r.status === 'present').length;
    const total   = recs.length;
    const pct     = total ? Math.round(present / total * 100) : 0;
    return { ...s, present, total, pct };
  });

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">👁️ Attendance Summary</div>
        </div>
        <div className="form-group" style={{ maxWidth:320, marginBottom:18 }}>
          <label className="form-label">Select Subject</label>
          <select className="form-select" value={selSub} onChange={e => setSelSub(e.target.value)}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>

        {loading
          ? <div style={{ textAlign:'center', padding:30, color:'var(--text3)' }}>Loading...</div>
          : <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Roll No.</th><th>Student</th><th>Present</th><th>Total</th><th>Attendance</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {summary.map(s => (
                    <tr key={s.id}>
                      <td><span className="badge info">{s.roll_no}</span></td>
                      <td style={{ fontWeight:600 }}>{s.name}</td>
                      <td style={{ color:'var(--green)' }}>{s.present}</td>
                      <td style={{ color:'var(--text3)' }}>{s.total}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:80, height:6, background:'var(--bg3)', borderRadius:99, overflow:'hidden' }}>
                            <div style={{ width:`${s.pct}%`, height:'100%', borderRadius:99,
                              background: s.pct>=75?'var(--green)':s.pct>=60?'var(--orange)':'var(--red)' }} />
                          </div>
                          <span style={{ fontSize:13, fontWeight:700 }}>{s.pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${s.pct>=75?'present':'absent'}`}>
                          {s.pct>=75 ? 'Regular' : 'Short'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

export function TeacherStudents() {
  const { user }   = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (user?.branch_id)
      axios.get(`/api/users/students?branch_id=${user.branch_id}`).then(r => setStudents(r.data));
  }, [user]);

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">🎓 My Students <span className="badge info">{students.length}</span></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Roll No.</th><th>Name</th><th>Email</th><th>Branch</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td><span className="badge info">{s.roll_no}</span></td>
                  <td style={{ fontWeight:600 }}>{s.name}</td>
                  <td style={{ color:'var(--text3)' }}>{s.email}</td>
                  <td>{s.branch_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewAttendance;
