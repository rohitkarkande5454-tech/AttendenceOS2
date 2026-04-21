import React, { useEffect, useState } from 'react';
import axios from '../../api';
import { toast } from 'react-toastify';

export default function AdminAttendance() {
  const [records,  setRecords]  = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search,   setSearch]   = useState('');
  const [filters,  setFilters]  = useState({ subject_id:'', date:'', status:'' });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    axios.get('/api/users/subjects').then(r => setSubjects(r.data));
    loadRecords();
  }, []);

  const loadRecords = (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.subject_id) params.subject_id = f.subject_id;
    if (f.date)       params.date       = f.date;
    axios.get('/api/attendance', { params })
      .then(r => setRecords(r.data))
      .finally(() => setLoading(false));
  };

  const applyFilters = (updated) => {
    setFilters(updated);
    loadRecords(updated);
  };

  const displayed = records.filter(r => {
    const matchStatus = !filters.status || r.status === filters.status;
    const matchSearch = !search
      || r.student_name?.toLowerCase().includes(search.toLowerCase())
      || r.roll_no?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const rows = [
      ['Roll No','Student','Subject','Date','Status'].join(','),
      ...displayed.map(r => [r.roll_no, r.student_name, r.subject_name, r.date, r.status].join(','))
    ].join('\n');
    const blob = new Blob([rows], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'attendance.csv'; a.click();
    toast.success('Attendance exported!');
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">📋 Attendance Records</div>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 Export CSV</button>
        </div>

        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search student..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width:'auto' }}
            value={filters.subject_id}
            onChange={e => applyFilters({...filters, subject_id:e.target.value})}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto' }}
            value={filters.status}
            onChange={e => setFilters({...filters, status:e.target.value})}>
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
          <input className="form-input" type="date" style={{ width:'auto' }}
            value={filters.date}
            onChange={e => applyFilters({...filters, date:e.target.value})} />
        </div>

        {loading
          ? <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading records...</div>
          : <>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Roll No.</th><th>Student</th><th>Subject</th><th>Date</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {displayed.slice(0,60).map((r,i) => (
                      <tr key={i}>
                        <td><span className="badge info">{r.roll_no}</span></td>
                        <td style={{ fontWeight:600 }}>{r.student_name}</td>
                        <td>{r.subject_name} <span style={{ color:'var(--text3)', fontSize:12 }}>({r.code})</span></td>
                        <td style={{ color:'var(--text3)' }}>{r.date}</td>
                        <td>
                          <span className={`badge ${r.status}`}>
                            {r.status === 'present' ? '✅ Present' : '❌ Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {displayed.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text3)', padding:28 }}>
                        No records found.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:10, textAlign:'right' }}>
                Showing {Math.min(60, displayed.length)} of {displayed.length} records
              </div>
            </>
        }
      </div>
    </div>
  );
}
