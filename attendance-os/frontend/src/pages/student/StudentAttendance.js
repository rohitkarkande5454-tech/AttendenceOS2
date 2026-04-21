import React, { useEffect, useState } from 'react';
import axios from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// ─── Student Attendance ─────────────────────────────────────────────────────
export function StudentAttendance() {
  const { user }   = useAuth();
  const [records,  setRecords]  = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter,   setFilter]   = useState({ subject:'', status:'' });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    axios.get('/api/attendance/my')
      .then(r => {
        setRecords(r.data);
        const uniqueSubs = [];
        const seen = new Set();
        r.data.forEach(a => { if (!seen.has(a.subject_id)) { seen.add(a.subject_id); uniqueSubs.push({ id:a.subject_id, name:a.subject_name, code:a.code }); }});
        setSubjects(uniqueSubs);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const displayed = records.filter(r => {
    const matchSub    = !filter.subject || String(r.subject_id) === filter.subject;
    const matchStatus = !filter.status  || r.status === filter.status;
    return matchSub && matchStatus;
  });

  const exportCSV = () => {
    const rows = [
      ['Subject','Code','Date','Status'].join(','),
      ...displayed.map(r => [r.subject_name, r.code, r.date, r.status].join(','))
    ].join('\n');
    const blob = new Blob([rows],{ type:'text/csv' });
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='my-attendance.csv'; a.click();
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">📋 My Attendance Records</div>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 Export CSV</button>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          <select className="form-select" style={{ width:'auto' }}
            value={filter.subject} onChange={e => setFilter({...filter, subject:e.target.value})}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto' }}
            value={filter.status} onChange={e => setFilter({...filter, status:e.target.value})}>
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {loading
          ? <div style={{ textAlign:'center', padding:30, color:'var(--text3)' }}>Loading...</div>
          : <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>Code</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {displayed.slice(0,50).map((r,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{r.subject_name}</td>
                      <td><span className="badge info">{r.code}</span></td>
                      <td style={{ color:'var(--text3)' }}>{r.date}</td>
                      <td><span className={`badge ${r.status}`}>{r.status==='present'?'✅ Present':'❌ Absent'}</span></td>
                    </tr>
                  ))}
                  {displayed.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--text3)', padding:28 }}>No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

// ─── Student Analytics ───────────────────────────────────────────────────────
export function StudentAnalytics() {
  const { user }  = useAuth();
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    if (user?.student_id)
      axios.get(`/api/attendance/summary/${user.student_id}`).then(r => setSummary(r.data));
  }, [user]);

  const totalPresent = summary.reduce((s,r) => s + Number(r.present||0), 0);
  const totalAbsent  = summary.reduce((s,r) => s + (Number(r.total||0) - Number(r.present||0)), 0);

  const trendChart = {
    labels: ['Week 1','Week 2','Week 3','Week 4'],
    datasets:[{
      label:'My Attendance %',
      data:[88,82,91,87],
      borderColor:'#4f8ef7',
      backgroundColor:'rgba(79,142,247,0.15)',
      tension:0.4, fill:true
    }]
  };

  const pieData = {
    labels:['Present','Absent'],
    datasets:[{
      data:[totalPresent, totalAbsent],
      backgroundColor:['rgba(34,197,94,0.8)','rgba(239,68,68,0.8)'],
      borderColor:['#22c55e','#ef4444'], borderWidth:2
    }]
  };

  const lineOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ color:'#94a3b8', font:{size:11} } } },
    scales:{
      x:{ ticks:{color:'#64748b'}, grid:{color:'rgba(255,255,255,0.05)'} },
      y:{ ticks:{color:'#64748b'}, grid:{color:'rgba(255,255,255,0.05)'}, min:0, max:100 }
    }
  };

  const pieOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', padding:14, font:{size:11} } } }
  };

  const best  = [...summary].sort((a,b)=>(b.percentage||0)-(a.percentage||0))[0];
  const worst = [...summary].sort((a,b)=>(a.percentage||0)-(b.percentage||0))[0];

  return (
    <div>
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">📈 Monthly Trend</div>
          <div className="chart-wrap"><Line data={trendChart} options={lineOpts} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-title">🎯 Present vs Absent</div>
          <div className="chart-wrap"><Doughnut data={pieData} options={pieOpts} /></div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title" style={{ marginBottom:16 }}>📊 Performance Insights</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:12 }}>
          {[
            { label:'Best Subject',     value: best?.name   || '—', icon:'🏆', color:'var(--green)' },
            { label:'Needs Attention',  value: worst?.name  || '—', icon:'⚠️', color:'var(--orange)' },
            { label:'Classes Attended', value: totalPresent,        icon:'✅', color:'var(--accent)' },
            { label:'Classes Missed',   value: totalAbsent,         icon:'❌', color:'var(--red)' },
          ].map((item,i) => (
            <div key={i} className="subject-card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:800, color:item.color }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentAttendance;
