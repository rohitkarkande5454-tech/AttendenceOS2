import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminBranches() {
  const [branches,  setBranches]  = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [bModal,    setBModal]    = useState(false);
  const [sModal,    setSModal]    = useState(false);
  const [bForm,     setBForm]     = useState({ name:'' });
  const [sForm,     setSForm]     = useState({ name:'', code:'', branch_id:'' });

  const load = () =>
    Promise.all([
      axios.get('/api/users/branches'),
      axios.get('/api/users/subjects'),
      axios.get('/api/users/students'),
    ]).then(([b,s,st]) => {
      setBranches(b.data); setSubjects(s.data); setStudents(st.data);
    });

  useEffect(() => { load(); }, []);

  const addBranch = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/branches', bForm);
      toast.success('Branch added!'); setBModal(false); setBForm({ name:'' }); load();
    } catch { toast.error('Error adding branch'); }
  };

  const addSubject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/subjects', sForm);
      toast.success('Subject added!'); setSModal(false); setSForm({ name:'', code:'', branch_id:'' }); load();
    } catch { toast.error('Error adding subject'); }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setBModal(true)}>+ Add Branch</button>
        <button className="btn btn-ghost btn-sm"   onClick={() => setSModal(true)}>+ Add Subject</button>
      </div>

      <div className="chart-grid">
        {branches.map(b => {
          const bSubs = subjects.filter(s => s.branch_id === b.id);
          const bStus = students.filter(s => s.branch_id === b.id);
          return (
            <div key={b.id} className="section-card" style={{ marginBottom:0 }}>
              <div className="section-title" style={{ marginBottom:14 }}>🏫 {b.name}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                <div style={{ background:'var(--bg3)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:26, fontWeight:800, color:'var(--accent)' }}>{bStus.length}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Students</div>
                </div>
                <div style={{ background:'var(--bg3)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:26, fontWeight:800, color:'var(--accent2)' }}>{bSubs.length}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Subjects</div>
                </div>
              </div>
              {bSubs.length === 0
                ? <div style={{ color:'var(--text3)', fontSize:13 }}>No subjects yet.</div>
                : bSubs.map((s,i) => (
                  <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'9px 0', borderBottom: i < bSubs.length-1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{s.code}</div>
                    </div>
                    <span className="badge info">{s.code}</span>
                  </div>
                ))
              }
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      {bModal && (
        <div className="modal-overlay" onClick={() => setBModal(false)}>
          <div className="modal" style={{ maxWidth:360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Branch</div>
              <button className="modal-close" onClick={() => setBModal(false)}>×</button>
            </div>
            <form onSubmit={addBranch}>
              <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input className="form-input" required value={bForm.name}
                  onChange={e => setBForm({ name:e.target.value })} placeholder="e.g. Mechanical Engineering" />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setBModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {sModal && (
        <div className="modal-overlay" onClick={() => setSModal(false)}>
          <div className="modal" style={{ maxWidth:400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Subject</div>
              <button className="modal-close" onClick={() => setSModal(false)}>×</button>
            </div>
            <form onSubmit={addSubject}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input className="form-input" required value={sForm.name}
                    onChange={e => setSForm({...sForm, name:e.target.value})} placeholder="e.g. Algorithms" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input className="form-input" required value={sForm.code}
                    onChange={e => setSForm({...sForm, code:e.target.value})} placeholder="e.g. CS304" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select className="form-select" required value={sForm.branch_id}
                  onChange={e => setSForm({...sForm, branch_id:e.target.value})}>
                  <option value="">Select branch...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setSModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
