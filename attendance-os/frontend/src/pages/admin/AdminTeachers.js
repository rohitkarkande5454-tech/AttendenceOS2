import React, { useEffect, useState } from 'react';
import axios from '../../api';
import { toast } from 'react-toastify';

export default function AdminTeachers() {
  const [teachers,  setTeachers]  = useState([]);
  const [branches,  setBranches]  = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [modal,     setModal]     = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [form, setForm] = useState({ name:'', email:'', password:'', branch_id:'', subject_ids:[] });

  const load = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/users/teachers'),
      axios.get('/api/users/branches'),
      axios.get('/api/users/subjects'),
    ]).then(([t,b,s]) => {
      setTeachers(t.data); setBranches(b.data); setSubjects(s.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleSubject = (sid) => {
    setForm(f => ({
      ...f,
      subject_ids: f.subject_ids.includes(sid)
        ? f.subject_ids.filter(x => x !== sid)
        : [...f.subject_ids, sid]
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/teachers', form);
      toast.success('Teacher added!');
      setModal(false);
      setForm({ name:'', email:'', password:'', branch_id:'', subject_ids:[] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await axios.delete(`/api/users/teachers/${id}`);
      toast.success('Teacher deleted!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting teacher');
    }
  };

  const filteredSubjects = subjects.filter(s => String(s.branch_id) === String(form.branch_id));

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            👨‍🏫 Teacher Management
            <span className="badge purple">{teachers.length}</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Add Teacher</button>
        </div>

        {loading
          ? <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading...</div>
          : <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Name</th><th>Email</th><th>Branch</th><th>Subjects</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight:600 }}>{t.name}</td>
                      <td style={{ color:'var(--text3)' }}>{t.email}</td>
                      <td>{t.branch_name}</td>
                      <td>
                        {t.codes?.split(', ').map((c,i) => (
                          <span key={i} className="badge info" style={{ marginRight:4 }}>{c}</span>
                        ))}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{ background:'#e74c3c', color:'#fff', border:'none' }}
                          onClick={() => handleDelete(t.id)}>
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text3)', padding:28 }}>
                      No teachers found.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
        }
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Teacher</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm({...form, name:e.target.value})} placeholder="Teacher name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" required type="email" value={form.email}
                    onChange={e => setForm({...form, email:e.target.value})} placeholder="Email" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password}
                    onChange={e => setForm({...form, password:e.target.value})} placeholder="Default: teacher123" />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select className="form-select" required value={form.branch_id}
                    onChange={e => setForm({...form, branch_id:e.target.value, subject_ids:[]})}>
                    <option value="">Select branch...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              {form.branch_id && (
                <div className="form-group">
                  <label className="form-label">Assign Subjects</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {filteredSubjects.map(s => (
                      <button type="button" key={s.id}
                        onClick={() => toggleSubject(s.id)}
                        className="btn btn-sm"
                        style={{
                          background: form.subject_ids.includes(s.id) ? 'var(--accent)' : 'var(--bg3)',
                          color:      form.subject_ids.includes(s.id) ? '#fff' : 'var(--text2)',
                          border: `1px solid ${form.subject_ids.includes(s.id) ? 'var(--accent)' : 'var(--border)'}`,
                        }}>
                        {s.code} — {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
