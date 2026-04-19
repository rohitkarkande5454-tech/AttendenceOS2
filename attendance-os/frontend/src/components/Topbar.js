import React from 'react';

export default function Topbar({ title, onHamburger, children }) {
  const today = new Date().toLocaleDateString('en-IN',
    { day:'2-digit', month:'short', year:'numeric' });

  return (
    <div className="topbar">
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button className="hamburger" onClick={onHamburger}>☰</button>
        <div className="page-title">{title}</div>
      </div>
      <div className="topbar-right">
        {children}
        <div className="topbar-date">📅 {today}</div>
      </div>
    </div>
  );
}
