import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StudentDashboard() {
  const { user }   = useAuth();
  const [summary,  setSummary]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (user?.student_id) {
      axios.get(`/api/attendance/summary/${user.student_id}`)
        .then(r => setSummary(r.data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const totalPresent = summary.reduce((s, r) => s + Number(r.present || 0), 0);
  const totalClasses = summary.reduce((s, r) => s + Number(r.total   || 0), 0);
  const overallPct   = totalClasses ? Math.round(totalPresent / totalClasses * 100) : 0;

  const chartData = {
    labels: summary.map(s => s.code),
    datasets: [{
      label: 'Attendance %',
      data:  summary.map(s => s.percentage || 0),
      backgroundColor: summary.map(s =>
        (s.percentage||0)>=75 ? 'rgba(34,197,94,0.7)' : (s.percentage||0)>=60 ? 'rgba(249,115,22,0.7)' : 'rgba(239,68,68,0.7)'
      ),
      borderColor: summary.map(s =>
        (s.percentage||0)>=75 ? '#22c55e' : (s.percentage||0)>=60 ? '#f97316' : '#ef4444'
      ),
      borderWidth:2, borderRadius:8
    }]
  };

  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.05)' } },
      y:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.05)' }, min:0, max:100 }
    }
  };

  return (
    <div>
      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Overall Attendance</div>
          <div className="stat-val blue">{overallPct}%</div>
          <div className={`stat-trend ${overallPct>=75?'up':'down'}`}>
            {overallPct>=75 ? '✅ Good Standing' : '⚠️ Below 75%'}
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🏫</div>
          <div className="stat-label">Branch</div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:800, color:'var(--green)', marginTop:8 }}>
            {user?.branch_name || '—'}
          </div>
          <div className="stat-sub">{user?.roll_no}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📚</div>
          <div className="stat-label">Subjects</div>
          <div className="stat-val purple">{summary.length}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Classes Attended</div>
          <div className="stat-val orange">{totalPresent}</div>
          <div className="stat-sub">out of {totalClasses}</div>
        </div>
      </div>

      {/* Chart */}
      {summary.length > 0 && (
        <div className="section-card">
          <div className="section-title" style={{ marginBottom:16 }}>📊 Subject-wise Attendance</div>
          <div className="chart-wrap"><Bar data={chartData} options={chartOpts} /></div>
        </div>
      )}

      {/* Subject Breakdown */}
      {!loading && (
        <div className="section-card">
          <div className="section-title" style={{ marginBottom:16 }}>📋 Detailed Breakdown</div>
          {summary.length === 0
            ? <div style={{ textAlign:'center', padding:30, color:'var(--text3)' }}>No attendance records yet.</div>
            : summary.map((s, i) => (
              <div key={s.id} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div>
                    <span style={{ fontSize:14, fontWeight:600 }}>{s.name}</span>
                    <span style={{ fontSize:12, color:'var(--text3)', marginLeft:8 }}>({s.code})</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>{s.present}/{s.total}</span>
                    <span className={`pct-pill ${(s.percentage||0)>=75?'high':(s.percentage||0)>=60?'mid':'low'}`}>
                      {s.percentage ?? 0}%
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width:`${s.percentage||0}%`,
                    background: (s.percentage||0)>=75?'var(--green)':(s.percentage||0)>=60?'var(--orange)':'var(--red)'
                  }} />
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
