import React, { useEffect, useState } from 'react';
import axios from '../../api';
import { toast } from 'react-toastify';

export default function AdminStudents() {
  const [students,  setStudents]  = useState([]);
  const [branches,  setBranches]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [branchF,   setBranchF]   = useState('all');
  const [modal,     setModal]     = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [form, setForm] = useState({ name:'', email:'', password:'', branch_id:'', roll_no:'' });

  const load = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/users/students'),
      axios.get('/api/users/branches'),
    ]).then(([s, b]) => {
      setStudents(s.data);
      setBranches(b.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = students.filter(s => {
    const matchB = branchF === 'all' || String(s.branch_id) === branchF;
    const matchS = !search || s.name.toLowerCase().includes(search.toLowerCase())
                           || s.roll_no.toLowerCase().includes(search.toLowerCase());
    return matchB && matchS;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/students', form);
      toast.success('Student added!');
      setModal(false);
      setForm({ name:'', email:'', password:'', branch_id:'', roll_no:'' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`/api/users/students/${id}`);
      toast.success('Student deleted');
      load();
    } catch {
      toast.error('Error deleting student');
    }
  };

  const exportCSV = () => {
    const rows = [['Roll No','Name','Email','Branch'].join(','),
      ...filtered.map(s => [s.roll_no, s.name, s.email, s.branch_name].join(','))
    ].join('\n');
    const blob = new Blob([rows], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download='students.csv'; a.click();
    toast.success('CSV exported!');
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            🎓 Student Management
            <span className="badge info">{students.length}</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 Export CSV</button>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Add Student</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search name or roll..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width:'auto' }}
            value={branchF} onChange={e => setBranchF(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {loading
          ? <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading...</div>
          : <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Roll No.</th><th>Name</th><th>Email</th><th>Branch</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><span className="badge info">{s.roll_no}</span></td>
                      <td style={{ fontWeight:600 }}>{s.name}</td>
                      <td style={{ color:'var(--text3)' }}>{s.email}</td>
                      <td>{s.branch_name}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text3)', padding:28 }}>
                      No students found.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
        }
      </div>

      {/* Add Student Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Student</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm({...form, name:e.target.value})} placeholder="Student name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" required value={form.roll_no}
                    onChange={e => setForm({...form, roll_no:e.target.value})} placeholder="e.g. CE2106" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" required type="email" value={form.email}
                    onChange={e => setForm({...form, email:e.target.value})} placeholder="Email address" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password}
                    onChange={e => setForm({...form, password:e.target.value})} placeholder="Default: student123" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select className="form-select" required value={form.branch_id}
                  onChange={e => setForm({...form, branch_id:e.target.value})}>
                  <option value="">Select branch...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
