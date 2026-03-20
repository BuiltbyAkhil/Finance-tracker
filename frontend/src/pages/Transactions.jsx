import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import AddTransactionModal from '../components/AddTransactionModal';

const CATEGORIES = ['All','Food','Rent','Travel','Shopping','Salary','Freelance','Entertainment','Healthcare','Education','Other'];
const CAT_ICONS  = { Food:'🍔', Rent:'🏠', Travel:'✈️', Shopping:'🛍️', Salary:'💼', Freelance:'💻', Entertainment:'🎬', Healthcare:'🏥', Education:'📚', Other:'📦' };
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

export default function Transactions() {
    const { refresh } = useOutletContext();
    const [transactions, setTransactions] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [showModal,    setShowModal]    = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);
    const [filters, setFilters] = useState({ type:'', category:'', startDate:'', endDate:'' });
    const [search, setSearch]   = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.type)      params.append('type',      filters.type);
            if (filters.category && filters.category !== 'All') params.append('category', filters.category);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate)   params.append('endDate',   filters.endDate);
            const res = await api.get(`/transactions?${params}`);
            setTransactions(res.data);
        } catch (_) {}
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filters, refresh, localRefresh]);

    const remove = async (id) => {
        if (!confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Deleted');
            setLocalRefresh(r => r+1);
        } catch (_) { toast.error('Failed to delete'); }
    };

    const filtered = search
        ? transactions.filter(t => t.description?.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
        : transactions;

    const totalIncome  = filtered.filter(t => t.type==='income').reduce((a,t) => a+t.amount, 0);
    const totalExpense = filtered.filter(t => t.type==='expense').reduce((a,t) => a+t.amount, 0);

    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
                <div>
                    <h2 style={{ fontWeight:800, fontSize:24 }}>Transactions</h2>
                    <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>{filtered.length} transactions found</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                    <a href="/api/transactions/export/csv" className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-download me-1"></i>Export CSV
                    </a>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-1"></i>Add
                    </button>
                </div>
            </div>

            {/* Summary Strip */}
            <div className="row g-3 mb-3">
                {[
                    { label:'Total Income',  value: fmt(totalIncome),  color:'var(--success)', icon:'bi-arrow-up-circle-fill' },
                    { label:'Total Expenses',value: fmt(totalExpense), color:'var(--danger)',  icon:'bi-arrow-down-circle-fill' },
                    { label:'Net Balance',   value: fmt(totalIncome - totalExpense), color: totalIncome >= totalExpense ? 'var(--success)' : 'var(--danger)', icon:'bi-wallet-fill' },
                ].map(s => (
                    <div key={s.label} className="col-4">
                        <div className="card">
                            <div className="card-body-custom" style={{ padding:'16px 20px' }}>
                                <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
                                <div style={{ fontSize:20, fontWeight:800, color:s.color, marginTop:4 }}>{s.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body-custom" style={{ padding:'16px 20px' }}>
                    <div className="row g-2 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Search</label>
                            <input className="form-control form-control-sm" placeholder="Search description..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Type</label>
                            <select className="form-select form-select-sm" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Category</label>
                            <select className="form-select form-select-sm" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">From Date</label>
                            <input className="form-control form-control-sm" type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">To Date</label>
                            <input className="form-control form-control-sm" type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
                        </div>
                        <div className="col-md-1">
                            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setFilters({ type:'', category:'', startDate:'', endDate:'' }); setSearch(''); }}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h6>No transactions found</h6>
                        <p style={{ fontSize:13 }}>Try changing your filters</p>
                    </div>
                ) : (
                    <div style={{ overflowX:'auto' }}>
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => (
                                    <tr key={t._id}>
                                        <td style={{ color:'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                                        <td>
                                            <div style={{ fontWeight:600 }}>{t.description || '—'}</div>
                                            {t.isRecurring && <span style={{ fontSize:11, color:'var(--primary)' }}>🔄 Auto</span>}
                                        </td>
                                        <td>
                                            <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--bg)', padding:'4px 10px', borderRadius:20, fontSize:13 }}>
                                                {CAT_ICONS[t.category]} {t.category}
                                            </span>
                                        </td>
                                        <td><span className={t.type==='income'?'badge-income':'badge-expense'}>{t.type}</span></td>
                                        <td>
                                            <span style={{ fontWeight:700, color: t.type==='income'?'var(--success)':'var(--danger)' }}>
                                                {t.type==='income'?'+':'-'}{fmt(t.amount)}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => remove(t._id)}>
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={() => { setShowModal(false); setLocalRefresh(r=>r+1); toast.success('Added!'); }} />}
        </div>
    );
}
