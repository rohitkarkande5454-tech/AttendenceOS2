import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const QUICK = [
  'What is my attendance?',
  'How to mark attendance?',
  'Which subject has low attendance?',
  'Attendance policy rules?',
  'How to export CSV?',
];

function matchScore(q, keywords) {
  return keywords.reduce((score, word) => score + (q.includes(word) ? 1 : 0), 0);
}

function mockAI(prompt, role) {
  const q = prompt.toLowerCase();

  const intents = [
    {
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening'],
      reply: () => `👋 Hello! I am AttendanceOS Assistant. How can I help you today?`
    },
    {
      keywords: ['my attendance', 'my present', 'my absent', 'meri attendance'],
      reply: () => {
        if (role === 'student') return '📊 Your overall attendance is around 75%. Check "My Attendance" section for subject-wise details.';
        if (role === 'teacher') return '📊 Check your class attendance stats in the Dashboard under Analytics.';
        return '📊 Admin can view complete attendance reports from the Attendance section.';
      }
    },
    {
      keywords: ['mark', 'attendance', 'take', 'submit'],
      reply: () => {
        if (role === 'teacher') return '✅ Go to "Mark Attendance" → Select subject & date → Mark each student → Click Submit.';
        return '⚠️ Only teachers can mark attendance. Students can only view their attendance.';
      }
    },
    {
      keywords: ['low', 'shortage', 'less', 'below 75'],
      reply: () => {
        if (role === 'student') return '⚠️ Check "My Attendance" page. Subjects below 75% are highlighted in red. Attend more classes!';
        return '⚠️ Go to Analytics section to see students with low attendance subject-wise.';
      }
    },
    {
      keywords: ['policy', 'rule', 'criteria', 'minimum'],
      reply: () => '📋 Attendance Policy:\n• Minimum 75% attendance required per subject\n• Below 75% = Not eligible for exams\n• Attendance marked per subject per day\n• Contact admin for corrections.'
    },
    {
      keywords: ['export', 'download', 'csv'],
      reply: () => {
        if (role === 'admin') return '📥 Go to Attendance section → Click "Export CSV" to download full report.';
        if (role === 'teacher') return '📥 Go to View Attendance → Select subject → Click Export CSV.';
        return '📥 CSV export is available for Admin and Teachers only.';
      }
    },
    {
      keywords: ['add', 'student', 'new student', 'register student'],
      reply: () => {
        if (role === 'admin') return '👥 Go to Admin → Students → Click "Add Student" → Fill details → Submit.';
        return '👥 Only Admin can add new students to the system.';
      }
    },
    {
      keywords: ['add', 'teacher', 'new teacher', 'register teacher'],
      reply: () => {
        if (role === 'admin') return '👨‍🏫 Go to Admin → Teachers → Click "Add Teacher" → Fill details → Submit.';
        return '👨‍🏫 Only Admin can add new teachers to the system.';
      }
    },
    {
      keywords: ['subject', 'course', 'class'],
      reply: () => {
        if (role === 'student') return '📚 Your enrolled subjects are shown on your Dashboard. Each subject has separate attendance tracking.';
        if (role === 'teacher') return '📚 Your assigned subjects are shown on your Dashboard. Mark attendance for each subject separately.';
        return '📚 Subjects can be managed from Admin → Branches section.';
      }
    },
    {
      keywords: ['branch', 'department', 'section'],
      reply: () => {
        if (role === 'admin') return '🏫 Manage branches from Admin → Branches section. You can add subjects to each branch.';
        return '🏫 Your branch is shown on your Dashboard profile card.';
      }
    },
    {
      keywords: ['password', 'login', 'forgot', 'reset'],
      reply: () => '🔐 Contact your administrator to reset your password.\nAdmin email: admin@college.edu'
    },
    {
      keywords: ['exam', 'eligible', 'eligibility', 'appear'],
      reply: () => '🎓 Minimum 75% attendance required per subject to be eligible for exams. Check your attendance now!'
    },
    {
      keywords: ['analytics', 'graph', 'chart', 'statistics', 'report'],
      reply: () => {
        if (role === 'student') return '📈 Go to "Analytics" section to see your attendance trends and subject-wise performance graphs.';
        if (role === 'admin') return '📈 Admin Analytics shows overall attendance, branch-wise stats, and student performance reports.';
        return '📈 Analytics section shows detailed attendance graphs and reports.';
      }
    },
    {
      keywords: ['today', 'aaj', 'todays'],
      reply: () => {
        if (role === 'teacher') return "📅 To mark today's attendance: Go to 'Mark Attendance' → Select today's date → Submit.";
        if (role === 'student') return "📅 Check 'My Attendance' section to see if today's attendance has been marked.";
        return "📅 Today's attendance records can be viewed in the Attendance section.";
      }
    },
    {
      keywords: ['thank', 'thanks', 'bye', 'goodbye', 'ok', 'okay'],
      reply: () => "😊 You're welcome! Feel free to ask anything anytime. Have a great day!"
    },
  ];

  let best = null;
  let max = 0;
  for (let intent of intents) {
    const score = matchScore(q, intent.keywords);
    if (score > max) { max = score; best = intent; }
  }

  if (best && max > 0) return best.reply();

  return `🤖 I can help with:\n• My attendance\n• Mark attendance\n• Low attendance subjects\n• Attendance policy\n• Exam eligibility\n• Export CSV\n• Analytics\n• Add student/teacher\n\nTry asking in simple words 🙂`;
}

export default function AiChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{
    role: 'bot',
    text: 'Good day! I am the Attendance OS Assistant. I can answer queries about attendance, policies, and system usage. Select a quick question or type your own!'
  }]);
  const [input, setInput] = useState('');
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
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const reply = mockAI(q, user?.role || 'guest');
    setLoading(false);

    // Typing effect
    let typed = '';
    setMsgs(m => [...m, { role: 'bot', text: '' }]);
    for (let char of reply) {
      typed += char;
      await new Promise(r => setTimeout(r, 12));
      setMsgs(m => {
        const updated = [...m];
        updated[updated.length - 1] = { role: 'bot', text: typed };
        return updated;
      });
    }
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
              style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>
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
