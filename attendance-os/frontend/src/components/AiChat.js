import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const QUICK = [
  'What is my attendance?',
  'How to mark attendance?',
  'Which subject has low attendance?',
  'Attendance policy rules?',
  'How to export CSV?',
];

function mockAI(prompt, role) {
  const q = prompt.toLowerCase();

  if (q.includes('attendance') && q.includes('my')) {
    if (role === 'student') return '📊 Your overall attendance is 75%. You need 75% minimum to be eligible for exams. Keep it up!';
    if (role === 'teacher') return '📊 You have marked attendance for 12 classes this month. Check the dashboard for detailed stats.';
    return '📊 Admin can view all attendance records from the Attendance section.';
  }
  if (q.includes('mark attendance') || q.includes('how to mark')) {
    if (role === 'teacher') return '✅ To mark attendance: Go to "Mark Attendance" → Select subject & date → Mark each student Present/Absent → Click Submit.';
    return '✅ Only teachers can mark attendance. Students can view their attendance from "My Attendance" section.';
  }
  if (q.includes('low attendance') || q.includes('subject')) {
    if (role === 'student') return '⚠️ Check "My Attendance" page to see subject-wise breakdown. Any subject below 75% is highlighted in red.';
    return '⚠️ Go to Analytics section to see which subjects have low attendance rates across students.';
  }
  if (q.includes('policy') || q.includes('rules')) {
    return '📋 Attendance Policy:\n• Minimum 75% attendance required\n• Below 75% = Not eligible for exams\n• Attendance is marked per subject\n• Contact admin for any corrections.';
  }
  if (q.includes('export') || q.includes('csv')) {
    if (role === 'admin') return '📥 Go to Attendance section → Click "Export CSV" button to download attendance records.';
    return '📥 CSV export is available for Admin and Teachers from the Attendance section.';
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `👋 Hello! I am AttendanceOS Assistant. How can I help you today?`;
  }
  if (q.includes('student') && role === 'admin') {
    return '👥 You can manage students from Admin → Students section. Add, view or remove students there.';
  }
  if (q.includes('teacher') && role === 'admin') {
    return '👨‍🏫 Manage teachers from Admin → Teachers section. Assign branches and subjects to teachers.';
  }
  if (q.includes('branch')) {
    return '🏫 Branches can be managed from Admin → Branches section. Each branch has its own subjects and students.';
  }
  if (q.includes('login') || q.includes('password')) {
    return '🔐 Contact your administrator to reset your password. Admin email: admin@college.edu';
  }

  return `🤖 I can help you with:\n• Attendance queries\n• How to mark attendance\n• Attendance policy\n• Export CSV\n• Subject-wise attendance\n\nPlease ask about any of these topics!`;
}

export default function AiChat() {
  const { user } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([{
    role: 'bot',
    text: 'Good day! I am the Attendance OS Assistant. I can answer queries about attendance, policies, and system usage. Select a quick question or type your own!'
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 800));
    const reply = mockAI(q, user?.role || 'guest');
    setMsgs(m => [...m, { role: 'bot', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="ai-panel">
      {open && (
        <div className="ai-box">
          <div className="ai-header">
            <div className="ai-title">
              <div className="ai-online" />
              🤖 AI Assistant
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:22, lineHeight:1 }}>
              ×
            </button>
          </div>
          <div className="ai-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                <div className="ai-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg bot">
                <div className="ai-bubble">
                  <div className="ai-dot-row">
                    <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="ai-quick">
            {QUICK.map((q, i) => (
              <button key={i} className="ai-qbtn" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
          <div className="ai-input-row">
            <input className="ai-input" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything..." />
            <button className="ai-send" onClick={() => send()}>➤</button>
          </div>
        </div>
      )}
      <button className="ai-fab" onClick={() => setOpen(o => !o)}>🤖</button>
    </div>
  );
}
