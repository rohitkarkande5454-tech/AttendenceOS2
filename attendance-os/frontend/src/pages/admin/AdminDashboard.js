import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [counts,    setCounts]    = useState({ students:0, teachers:0, subjects:0 });
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/attendance/analytics'),
      axios.get('/api/users/students'),
      axios.get('/api/users/teachers'),
      axios.get('/api/users/subjects'),
    ]).then(([ana, stu, tea, sub]) => {
      setAnalytics(ana.data);
      setCounts({ students: stu.data.length, teachers: tea.data.length, subjects: sub.data.length });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color:'var(--text3)', padding:40, textAlign:'center' }}>Loading analytics...</div>;

  const { overall, branchStats=[], subjectStats=[] } = analytics || {};

  /* Chart configs */
  const branchChart = {
    labels: branchStats.map(b => b.name),
    datasets: [{
      data: branchStats.map(b => b.percentage || 0),
      backgroundColor: ['rgba(79,142,247,0.8)', 'rgba(108,99,255,0.8)'],
      borderColor: ['#4f8ef7','#6c63ff'], borderWidth: 2,
    }]
  };

  const subChart = {
    labels: subjectStats.map(s => s.code),
    datasets: [{
      label: 'Attendance %',
      data: subjectStats.map(s => s.percentage || 0),
      backgroundColor: ['#4f8ef7CC','#6c63ffCC','#22c55eCC','#f97316CC','#ef4444CC','#eab308CC'],
      borderColor:     ['#4f8ef7','#6c63ff','#22c55e','#f97316','#ef4444','#eab308'],
      borderWidth: 2, borderRadius: 8,
    }]
  };

  const trendChart = {
    labels: ['Week 1','Week 2','Week 3','Week 4'],
    datasets: [
      { label:'Computer Eng', data:[88,84,90,87], borderColor:'#4f8ef7', backgroundColor:'rgba(79,142,247,0.1)', tension:0.4, fill:true },
      { label:'Info Tech',    data:[82,79,85,83], borderColor:'#6c63ff', backgroundColor:'rgba(108,99,255,0.1)', tension:0.4, fill:true },
    ]
  };

  const axisOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ color:'#94a3b8', font:{ size:11 } } } },
    scales:{
      x:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.05)' } },
      y:{ ticks:{ color:'#64748b' }, grid:{ color:'rgba(255,255,255,0.05)' }, min:0, max:100 }
    }
  };
  const pieOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', padding:14, font:{ size:11 } } } }
  };

  return (
    <div>
      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Overall Attendance</div>
          <div className="stat-val blue">{overall?.percentage ?? 0}%</div>
          <div className="stat-trend up">↑ +2.4% this month</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🎓</div>
          <div className="stat-label">Total Students</div>
          <div className="stat-val green">{counts.students}</div>
          <div className="stat-sub">Across all branches</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-label">Teachers</div>
          <div className="stat-val purple">{counts.teachers}</div>
          <div className="stat-sub">{counts.subjects} subjects total</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Total Records</div>
          <div className="stat-val orange">{overall?.total ?? 0}</div>
          <div className="stat-sub">{overall?.present ?? 0} present classes</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">📈 Weekly Attendance Trend</div>
          <div className="chart-wrap"><Line data={trendChart} options={axisOpts} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-title">🍩 Branch-wise Distribution</div>
          <div className="chart-wrap"><Doughnut data={branchChart} options={pieOpts} /></div>
        </div>
      </div>

      {/* Subject Bar Chart */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">📚 Subject-wise Attendance</div>
        </div>
        <div className="chart-wrap" style={{ height:200 }}>
          <Bar data={subChart} options={axisOpts} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="chart-grid">
        <div className="section-card" style={{ marginBottom:0 }}>
          <div className="section-title" style={{ marginBottom:16 }}>🏫 Branch Analysis</div>
          {branchStats.map((b, i) => (
            <div key={b.id} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{b.name}</span>
                <span className={`pct-pill ${(b.percentage||0)>=75?'high':(b.percentage||0)>=60?'mid':'low'}`}>
                  {b.percentage ?? 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${b.percentage||0}%`, background: i===0?'var(--accent)':'var(--accent2)' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="section-card" style={{ marginBottom:0 }}>
          <div className="section-title" style={{ marginBottom:16 }}>📊 Top Subjects</div>
          {[...subjectStats].sort((a,b)=>(b.percentage||0)-(a.percentage||0)).slice(0,4).map((s,i)=>(
            <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'10px 0', borderBottom: i<3?'1px solid var(--border)':'none' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{s.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{s.code} · {s.branch_name}</div>
              </div>
              <span className={`pct-pill ${(s.percentage||0)>=75?'high':(s.percentage||0)>=60?'mid':'low'}`}>
                {s.percentage ?? 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
