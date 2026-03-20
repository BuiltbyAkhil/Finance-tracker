import React, { useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food','Rent','Travel','Shopping','Salary','Freelance','Entertainment','Healthcare','Education','Other'];
const CAT_ICONS  = { Food:'🍔', Rent:'🏠', Travel:'✈️', Shopping:'🛍️', Salary:'💼', Freelance:'💻', Entertainment:'🎬', Healthcare:'🏥', Education:'📚', Other:'📦' };

export default function AddTransactionModal({ onClose, onAdded, prefill = {} }) {
    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        type: prefill.type || 'expense',
        amount: prefill.amount || '',
        category: prefill.category || 'Food',
        description: prefill.description || '',
        date: prefill.date || today,
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0) return toast.error('Enter a valid amount');
        setSaving(true);
        try {
            await api.post('/transactions', form);
            onAdded();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        } finally { setSaving(false); }
    };

    return (
        <div className="modal show d-block" style={{ background:'rgba(0,0,0,0.5)', zIndex:1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">➕ Add Transaction</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            {/* Type Toggle */}
                            <div className="mb-3">
                                <label className="form-label">Type</label>
                                <div className="type-toggle">
                                    <button type="button" className={`type-btn income ${form.type==='income'?'active':''}`} onClick={() => set('type','income')}>
                                        <i className="bi bi-arrow-up-circle me-1"></i> Income
                                    </button>
                                    <button type="button" className={`type-btn expense ${form.type==='expense'?'active':''}`} onClick={() => set('type','expense')}>
                                        <i className="bi bi-arrow-down-circle me-1"></i> Expense
                                    </button>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="form-label">Amount (₹)</label>
                                    <input className="form-control" type="number" min="1" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Date</label>
                                    <input className="form-control" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Category</label>
                                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                                        {CATEGORIES.map(c => (
                                            <button key={c} type="button" onClick={() => set('category', c)}
                                                style={{ padding:'8px 4px', borderRadius:10, border:`2px solid ${form.category===c?'var(--primary)':'var(--border)'}`, background: form.category===c?'var(--primary-light)':'var(--bg)', cursor:'pointer', fontSize:11, fontWeight:600, color: form.category===c?'var(--primary)':'var(--text-muted)', textAlign:'center', transition:'all 0.15s' }}>
                                                <div style={{ fontSize:18, marginBottom:2 }}>{CAT_ICONS[c]}</div>
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Description (optional)</label>
                                    <input className="form-control" placeholder="e.g. Lunch at office" value={form.description} onChange={e => set('description', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className={`btn ${form.type==='income'?'btn-success':'btn-danger'}`} disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <>Add {form.type === 'income' ? 'Income' : 'Expense'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
