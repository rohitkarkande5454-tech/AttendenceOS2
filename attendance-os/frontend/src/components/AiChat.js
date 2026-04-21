import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;

const QUICK = [
  'What is my attendance?',
  'How to mark attendance?',
  'Which subject has low attendance?',
  'Attendance policy rules?',
  'How to export CSV?',
];

async function askGemini(prompt, role) {
  try {
    const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are AttendanceOS AI Assistant for a college attendance management system. 
User role: ${role}. Be concise, helpful, and professional.
Question: ${prompt}`
            }]
          }]
        })
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.';
  } catch {
    return 'AI service unavailable. Please check your connection.';
  }
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
    const reply = await askGemini(q, user?.role || 'guest');
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
