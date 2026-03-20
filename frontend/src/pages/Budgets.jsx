import React, { useEffect, useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food','Rent','Travel','Shopping','Entertainment','Healthcare','Education','Other'];
const CAT_ICONS  = { Food:'🍔', Rent:'🏠', Travel:'✈️', Shopping:'🛍️', Entertainment:'🎬', Healthcare:'🏥', Education:'📚', Other:'📦' };
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

export default function Budgets() {
    const [budgets,  setBudgets]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [form,     setForm]     = useState({ category:'Food', amount:'', month: new Date().getMonth()+1, year: new Date().getFullYear() });
    const [saving,   setSaving]   = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date().getMonth()+1);
    const [viewYear,  setViewYear]  = useState(new Date().getFullYear());

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/budgets?month=${viewMonth}&year=${viewYear}`);
            setBudgets(res.data);
        } catch (_) {}
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [viewMonth, viewYear]);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0) return toast.error('Enter a valid amount');
        setSaving(true);
        try {
            await api.post('/budgets', form);
            toast.success('Budget saved!');
            load();
            setForm({ ...form, amount:'' });
        } catch (_) { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this budget?')) return;
        try { await api.delete(`/budgets/${id}`); toast.success('Deleted'); load(); }
        catch (_) { toast.error('Failed'); }
    };

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    return (
        <div>
            <div style={{ marginBottom:28 }}>
                <h2 style={{ fontWeight:800, fontSize:24 }}>Budget Goals</h2>
                <p style={{ color:'var(--text-muted)', marginTop:4 }}>Set monthly spending limits per category</p>
            </div>

            <div className="row g-3">
                {/* Set Budget Form */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header-custom"><h6 style={{ fontWeight:700, margin:0 }}>➕ Set Budget</h6></div>
                        <div className="card-body-custom">
                            <form onSubmit={submit}>
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Monthly Budget (₹)</label>
                                    <input className="form-control" type="number" min="1" placeholder="e.g. 5000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="form-label">Month</label>
                                        <select className="form-select" value={form.month} onChange={e => setForm({...form, month: parseInt(e.target.value)})}>
                                            {months.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Year</label>
                                        <input className="form-control" type="number" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                                <button className="btn btn-primary w-100" type="submit" disabled={saving}>
                                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : 'Save Budget'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Email Alert Info */}
                    <div className="card mt-3" style={{ background:'var(--warning-light)', border:'1px solid var(--warning)' }}>
                        <div className="card-body-custom" style={{ padding:'14px 18px' }}>
                            <h6 style={{ fontWeight:700, color:'var(--warning)' }}>⚠️ Email Alerts</h6>
                            <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>
                                When you exceed a budget limit, you'll automatically receive an email alert. Configure your email in the backend <code>.env</code> file.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Budget Progress */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header-custom">
                            <h6 style={{ fontWeight:700, margin:0 }}>📊 Budget Progress</h6>
                            <div style={{ display:'flex', gap:8 }}>
                                <select className="form-select form-select-sm" style={{ width:100 }} value={viewMonth} onChange={e => setViewMonth(parseInt(e.target.value))}>
                                    {months.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                                </select>
                                <input className="form-control form-control-sm" type="number" style={{ width:80 }} value={viewYear} onChange={e => setViewYear(parseInt(e.target.value))} />
                            </div>
                        </div>
                        <div className="card-body-custom">
                            {loading ? (
                                <div className="text-center py-4"><div className="spinner-border"></div></div>
                            ) : budgets.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🎯</div>
                                    <h6>No budgets set</h6>
                                    <p style={{ fontSize:13 }}>Set a budget on the left to start tracking</p>
                                </div>
                            ) : (
                                budgets.map(b => {
                                    const pct = Math.min(100, b.percentage || 0);
                                    const over = b.spent > b.amount;
                                    const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';
                                    return (
                                        <div key={b._id} className="budget-item">
                                            <div className="budget-header">
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <span style={{ fontSize:24 }}>{CAT_ICONS[b.category] || '📦'}</span>
                                                    <div>
                                                        <div className="budget-category">{b.category}</div>
                                                        {over && <span style={{ fontSize:11, color:'#ef4444', fontWeight:600 }}>⚠️ Over budget!</span>}
                                                    </div>
                                                </div>
                                                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                                    <div style={{ textAlign:'right' }}>
                                                        <div style={{ fontSize:15, fontWeight:700, color: over?'#ef4444':'var(--text)' }}>{fmt(b.spent)}</div>
                                                        <div className="budget-amounts">of {fmt(b.amount)}</div>
                                                    </div>
                                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => remove(b._id)}>
                                                        <i className="bi bi-trash3"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-bar" style={{ width:`${pct}%`, background:barColor }}></div>
                                            </div>
                                            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                                                <span style={{ fontSize:12, color:'var(--text-muted)' }}>{pct}% used</span>
                                                <span style={{ fontSize:12, color: over?'#ef4444':'var(--success)', fontWeight:600 }}>
                                                    {over ? `${fmt(b.spent - b.amount)} over` : `${fmt(b.amount - b.spent)} left`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
