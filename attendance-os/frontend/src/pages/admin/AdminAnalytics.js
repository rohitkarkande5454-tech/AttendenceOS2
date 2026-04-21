import React, { useEffect, useState } from 'react';
import axios from '../../api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/attendance/analytics')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading analytics...</div>;

  const { overall, branchStats=[], subjectStats=[], lowAttendance=[] } = data || {};

  const barOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.05)' } },
      y:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.05)' }, min:0, max:100 }
    }
  };

  const subChart = {
    labels: subjectStats.map(s => s.code),
    datasets: [{
      label: 'Attendance %',
      data: subjectStats.map(s => s.percentage || 0),
      backgroundColor: subjectStats.map(s =>
        (s.percentage||0)>=75 ? 'rgba(34,197,94,0.7)' : (s.percentage||0)>=60 ? 'rgba(249,115,22,0.7)' : 'rgba(239,68,68,0.7)'
      ),
      borderColor: subjectStats.map(s =>
        (s.percentage||0)>=75 ? '#22c55e' : (s.percentage||0)>=60 ? '#f97316' : '#ef4444'
      ),
      borderWidth:2, borderRadius:8
    }]
  };

  const pieData = {
    labels:['Present','Absent'],
    datasets:[{
      data:[ overall?.present||0, (overall?.total||0)-(overall?.present||0) ],
      backgroundColor:['rgba(34,197,94,0.8)','rgba(239,68,68,0.8)'],
      borderColor:['#22c55e','#ef4444'], borderWidth:2
    }]
  };
  const pieOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', padding:14, font:{ size:11 } } } }
  };

  return (
    <div>
      {/* Top stats */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Overall %</div>
          <div className="stat-val blue">{overall?.percentage ?? 0}%</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Present Classes</div>
          <div className="stat-val green">{overall?.present ?? 0}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">❌</div>
          <div className="stat-label">Absent Classes</div>
          <div className="stat-val red">{(overall?.total||0)-(overall?.present||0)}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⚠️</div>
          <div className="stat-label">Below 75%</div>
          <div className="stat-val orange">{lowAttendance.length}</div>
          <div className="stat-sub">Students need attention</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">📚 Subject-wise Attendance</div>
          <div className="chart-wrap"><Bar data={subChart} options={barOpts} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-title">🎯 Present vs Absent</div>
          <div className="chart-wrap"><Doughnut data={pieData} options={pieOpts} /></div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="section-card" style={{ marginBottom:0 }}>
          <div className="section-title" style={{ marginBottom:16 }}>🏫 Branch-wise Summary</div>
          {branchStats.map((b,i) => (
            <div key={b.id} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{b.name}</span>
                <span className={`pct-pill ${(b.percentage||0)>=75?'high':(b.percentage||0)>=60?'mid':'low'}`}>
                  {b.percentage ?? 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width:`${b.percentage||0}%`,
                  background: i===0 ? 'var(--accent)' : 'var(--accent2)'
                }} />
              </div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
                {b.present ?? 0} / {b.total ?? 0} classes
              </div>
            </div>
          ))}
        </div>

        <div className="section-card" style={{ marginBottom:0 }}>
          <div className="section-title" style={{ marginBottom:16 }}>⚠️ Students Below 75%</div>
          {lowAttendance.length === 0
            ? <div style={{ color:'var(--green)', textAlign:'center', padding:20, fontSize:14 }}>
                🎉 All students have good attendance!
              </div>
            : lowAttendance.map((s,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'10px 0', borderBottom: i < lowAttendance.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{s.roll_no} · {s.branch_name}</div>
                </div>
                <span className="pct-pill low">{s.percentage ?? 0}%</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
