import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const CAT_ICONS = { Food:'🍔', Rent:'🏠', Travel:'✈️', Shopping:'🛍️', Salary:'💼', Freelance:'💻', Entertainment:'🎬', Healthcare:'🏥', Education:'📚', Other:'📦' };
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function Dashboard() {
    const { user }  = useAuth();
    const { refresh } = useOutletContext();
    const [summary, setSummary] = useState(null);
    const [recent,  setRecent]  = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await api.post('/recurring/process');
                const [s, r] = await Promise.all([
                    api.get('/transactions/summary'),
                    api.get('/transactions?limit=5')
                ]);
                setSummary(s.data);
                setRecent(r.data);
            } catch (_) {}
            finally { setLoading(false); }
        };
        load();
    }, [refresh]);

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400, gap:16 }}>
            <div className="spinner-border"></div>
            <span style={{ color:'var(--text-muted)', fontSize:14 }}>Loading your finances…</span>
        </div>
    );

    const savings = (summary?.monthlyIncome || 0) - (summary?.monthlyExpense || 0);
    const savRate = summary?.monthlyIncome > 0 ? Math.round((savings / summary.monthlyIncome) * 100) : 0;
    const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div>
            {/* Welcome Header */}
            <div style={{ marginBottom:28, display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div>
                    <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, letterSpacing:'-0.4px', marginBottom:4 }}>
                        {getGreeting()}, {user?.name?.split(' ')[0]} 👋
                    </h2>
                    <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>
                        Financial overview for <span style={{ color:'var(--primary)', fontWeight:600 }}>{monthName}</span>
                    </p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                    <Link to="/transactions" className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-clock-history"></i> History
                    </Link>
                    <a href="/api/transactions/export/csv" className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-download"></i> Export
                    </a>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="row g-3 mb-4">
                {[
                    { cls:'stat-balance',  icon:'bi-wallet-fill',           emoji:'💰', label:'Total Balance',     value: fmt(summary?.balance) },
                    { cls:'stat-income',   icon:'bi-arrow-up-circle-fill',  emoji:'📈', label:'Income This Month', value: fmt(summary?.monthlyIncome) },
                    { cls:'stat-expense',  icon:'bi-arrow-down-circle-fill',emoji:'📉', label:'Expenses',          value: fmt(summary?.monthlyExpense) },
                    { cls:'stat-saving',   icon:'bi-piggy-bank-fill',       emoji:'🏦', label:'Savings',           value: fmt(savings), change: `${savRate}% saved` },
                ].map((s, i) => (
                    <div key={i} className="col-6 col-xl-3">
                        <div className={`stat-card ${s.cls}`}>
                            <div className="stat-card-icon"><i className={`bi ${s.icon}`}></i></div>
                            <div className="stat-card-value">{s.value}</div>
                            <div className="stat-card-label">{s.label}</div>
                            {s.change && <div className="stat-card-change">{s.change}</div>}
                            <div className="stat-card-bg">{s.emoji}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {/* Recent Transactions */}
                <div className="col-lg-7">
                    <div className="card h-100">
                        <div className="card-header-custom">
                            <div>
                                <h5 style={{ fontWeight:700, margin:0, fontSize:15 }}>Recent Transactions</h5>
                                <p style={{ color:'var(--text-muted)', fontSize:12, margin:'2px 0 0' }}>Your latest activity</p>
                            </div>
                            <Link to="/transactions" className="btn btn-outline-secondary btn-sm">
                                View all <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>
                        <div className="card-body-custom">
                            {recent.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">💸</div>
                                    <h6 style={{ fontWeight:700, marginBottom:6 }}>No transactions yet</h6>
                                    <p style={{ fontSize:13 }}>Click "Add" in the header to get started</p>
                                </div>
                            ) : recent.map(t => (
                                <div key={t._id} className="transaction-item">
                                    <div className={`transaction-icon cat-${t.category.toLowerCase()}`}>{CAT_ICONS[t.category] || '📦'}</div>
                                    <div className="transaction-info">
                                        <div className="transaction-desc">{t.description || t.category}</div>
                                        <div className="transaction-meta">
                                            <span style={{ background:'rgba(255,255,255,0.06)', padding:'1px 7px', borderRadius:4, fontSize:11 }}>{t.category}</span>
                                            <span style={{ margin:'0 6px', opacity:0.4 }}>·</span>
                                            <span>{new Date(t.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${t.type==='income'?'amount-income':'amount-expense'}`}>
                                        {t.type==='income'?'+':'-'}{fmt(t.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar panels */}
                <div className="col-lg-5" style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {/* Monthly Progress */}
                    <div className="card">
                        <div className="card-body-custom">
                            <h6 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:20, fontSize:14 }}>
                                Monthly Progress
                            </h6>
                            {[
                                { label:'Income',   value: summary?.monthlyIncome,  max: summary?.monthlyIncome,  color:'var(--success)' },
                                { label:'Expenses', value: summary?.monthlyExpense, max: summary?.monthlyIncome,  color:'var(--danger)'  },
                                { label:'Savings',  value: Math.max(0, savings),    max: summary?.monthlyIncome,  color:'var(--warning)' },
                            ].map(item => {
                                const pct = item.max > 0 ? Math.min(100, Math.round((item.value / item.max) * 100)) : 0;
                                return (
                                    <div key={item.label} style={{ marginBottom:18 }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7, alignItems:'center' }}>
                                            <span style={{ fontSize:12.5, fontWeight:600, color:'var(--text)' }}>{item.label}</span>
                                            <span style={{ fontSize:12.5, color:'var(--text-muted)', fontFamily:'var(--font-display)', fontWeight:600 }}>{fmt(item.value)}</span>
                                        </div>
                                        <div className="progress">
                                            <div className="progress-bar" style={{ width:`${pct}%`, background:item.color }}></div>
                                        </div>
                                        <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:4, textAlign:'right' }}>{pct}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="card">
                        <div className="card-body-custom">
                            <h6 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:14, fontSize:14 }}>
                                Quick Actions
                            </h6>
                            <div className="d-grid gap-2">
                                {[
                                    { to:'/transactions', icon:'bi-list-ul',      label:'All Transactions' },
                                    { to:'/analytics',    icon:'bi-bar-chart',    label:'Analytics'        },
                                    { to:'/budgets',      icon:'bi-wallet2',      label:'Manage Budgets'   },
                                    { to:'/recurring',    icon:'bi-arrow-repeat', label:'Recurring Payments'},
                                ].map(item => (
                                    <Link key={item.to} to={item.to} className="btn btn-outline-secondary btn-sm" style={{ justifyContent:'flex-start', padding:'9px 14px' }}>
                                        <i className={`bi ${item.icon}`} style={{ color:'var(--primary)' }}></i>
                                        <span>{item.label}</span>
                                        <i className="bi bi-chevron-right ms-auto" style={{ opacity:0.3, fontSize:11 }}></i>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
