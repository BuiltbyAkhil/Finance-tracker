import React, { useEffect, useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food','Rent','Travel','Shopping','Salary','Freelance','Entertainment','Healthcare','Education','Other'];
const CAT_ICONS  = { Food:'🍔', Rent:'🏠', Travel:'✈️', Shopping:'🛍️', Salary:'💼', Freelance:'💻', Entertainment:'🎬', Healthcare:'🏥', Education:'📚', Other:'📦' };
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

export default function Recurring() {
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [form,    setForm]    = useState({ type:'expense', amount:'', category:'Rent', description:'', dayOfMonth:1 });

    const load = async () => {
        setLoading(true);
        try { const res = await api.get('/recurring'); setItems(res.data); }
        catch (_) {}
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0) return toast.error('Enter a valid amount');
        setSaving(true);
        try {
            await api.post('/recurring', form);
            toast.success('Recurring transaction created!');
            setForm({ type:'expense', amount:'', category:'Rent', description:'', dayOfMonth:1 });
            load();
        } catch (_) { toast.error('Failed to create'); }
        finally { setSaving(false); }
    };

    const toggle = async (id, isActive) => {
        try {
            await api.put(`/recurring/${id}`, { isActive: !isActive });
            toast.success(isActive ? 'Paused' : 'Activated');
            load();
        } catch (_) { toast.error('Failed'); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this recurring transaction?')) return;
        try { await api.delete(`/recurring/${id}`); toast.success('Deleted'); load(); }
        catch (_) { toast.error('Failed'); }
    };

    const ordinal = (n) => {
        const s = ['th','st','nd','rd'];
        const v = n%100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
    };

    return (
        <div>
            <div style={{ marginBottom:28 }}>
                <h2 style={{ fontWeight:800, fontSize:24 }}>Recurring Transactions</h2>
                <p style={{ color:'var(--text-muted)', marginTop:4 }}>Auto-add transactions every month on a set day</p>
            </div>

            <div className="row g-3">
                {/* Form */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header-custom"><h6 style={{ fontWeight:700, margin:0 }}>➕ Add Recurring</h6></div>
                        <div className="card-body-custom">
                            <form onSubmit={submit}>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <div className="type-toggle">
                                        <button type="button" className={`type-btn income ${form.type==='income'?'active':''}`} onClick={() => setForm({...form, type:'income'})}>
                                            <i className="bi bi-arrow-up-circle me-1"></i>Income
                                        </button>
                                        <button type="button" className={`type-btn expense ${form.type==='expense'?'active':''}`} onClick={() => setForm({...form, type:'expense'})}>
                                            <i className="bi bi-arrow-down-circle me-1"></i>Expense
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Amount (₹)</label>
                                    <input className="form-control" type="number" min="1" placeholder="e.g. 15000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <input className="form-control" placeholder="e.g. Monthly Rent, Salary" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Day of Month (1-31)</label>
                                    <input className="form-control" type="number" min="1" max="31" value={form.dayOfMonth} onChange={e => setForm({...form, dayOfMonth: parseInt(e.target.value)})} required />
                                    <small style={{ color:'var(--text-muted)', fontSize:12, marginTop:4, display:'block' }}>
                                        This will auto-add every {ordinal(form.dayOfMonth)} of the month
                                    </small>
                                </div>
                                <button className="btn btn-primary w-100" type="submit" disabled={saving}>
                                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : '🔄 Create Recurring'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header-custom">
                            <h6 style={{ fontWeight:700, margin:0 }}>🔄 Your Recurring Transactions</h6>
                            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{items.length} active</span>
                        </div>
                        <div className="card-body-custom">
                            {loading ? (
                                <div className="text-center py-4"><div className="spinner-border"></div></div>
                            ) : items.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔄</div>
                                    <h6>No recurring transactions</h6>
                                    <p style={{ fontSize:13 }}>Add recurring entries like rent, salary, subscriptions</p>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                                        <div className={`transaction-icon cat-${item.category.toLowerCase()}`}>{CAT_ICONS[item.category]}</div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ fontWeight:600, fontSize:14 }}>{item.description || item.category}</div>
                                            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                                                <span className={item.type==='income'?'badge-income':'badge-expense'}>{item.type}</span>
                                                <span style={{ margin:'0 8px' }}>•</span>
                                                <span>{item.category}</span>
                                                <span style={{ margin:'0 8px' }}>•</span>
                                                <span>Every {ordinal(item.dayOfMonth)}</span>
                                                {item.nextRun && (
                                                    <>
                                                        <span style={{ margin:'0 8px' }}>•</span>
                                                        <span>Next: {new Date(item.nextRun).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight:700, fontSize:15, color: item.type==='income'?'var(--success)':'var(--danger)', marginRight:8 }}>
                                            {item.type==='income'?'+':'-'}{fmt(item.amount)}
                                        </div>
                                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                                            <div className="form-check form-switch mb-0" title={item.isActive ? 'Pause' : 'Activate'}>
                                                <input className="form-check-input" type="checkbox" checked={item.isActive} onChange={() => toggle(item._id, item.isActive)} style={{ cursor:'pointer', width:36, height:20 }} />
                                            </div>
                                            <button className="btn btn-danger btn-sm" onClick={() => remove(item._id)}>
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card mt-3" style={{ background:'var(--info-light)', border:'1px solid var(--info)' }}>
                        <div className="card-body-custom" style={{ padding:'14px 18px' }}>
                            <h6 style={{ fontWeight:700, color:'var(--info)' }}>ℹ️ How it works</h6>
                            <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>
                                Recurring transactions are automatically added when you visit the app on or after the scheduled day each month. Toggle the switch to pause/resume any recurring entry.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
