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
  const includesAny = (words) => words.some(w => q.includes(w));

  if (includesAny(['hi', 'hello', 'hey'])) {
    return `👋 Hello! I am AttendanceOS Assistant. How can I help you today?`;
  }

  if (includesAny(['attendance', 'present', 'absent'])) {
    if (includesAny(['my', 'mine'])) {
      if (role === 'student') return '📊 Your attendance is around 75%. Try to maintain above 75% for eligibility.';
      if (role === 'teacher') return '📊 You can check attendance stats in the dashboard under analytics.';
      return '📊 Admin can view complete attendance reports from the dashboard.';
    }
    return '📊 Attendance is tracked subject-wise. You can view details in the Attendance section.';
  }

  if (includesAny(['mark', 'submit', 'take attendance'])) {
    if (role === 'teacher') return '✅ Go to "Mark Attendance" → Select subject → Mark students → Submit.';
    return '⚠️ Only teachers can mark attendance.';
  }

  if (includesAny(['low', 'shortage', 'less'])) {
    return '⚠️ Subjects below 75% are highlighted in red in your attendance dashboard.';
  }

  if (includesAny(['policy', 'rule', 'criteria'])) {
    return '📋 Minimum 75% attendance required. Below that, exam eligibility may be denied.';
  }

  if (includesAny(['export', 'download', 'csv'])) {
    return '📥 Go to Attendance → Click "Export CSV" to download records.';
  }

  if (role === 'admin' && includesAny(['student'])) {
    return '👥 Manage students from Admin → Students section.';
  }

  if (role === 'admin' && includesAny(['teacher'])) {
    return '👨‍🏫 Manage teachers from Admin → Teachers section.';
  }

  if (includesAny(['password', 'login'])) {
    return '🔐 Contact admin to reset your password.';
  }

  return `🤖 I can help with:\n• Attendance info\n• Marking attendance\n• Policies\n• CSV export\n\nTry asking in simple words 🙂`;
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
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
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
