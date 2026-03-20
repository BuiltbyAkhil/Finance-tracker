import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddTransactionModal from './AddTransactionModal';

const NAV = [
    { to: '/dashboard',    icon: 'bi-grid-fill',        label: 'Dashboard'    },
    { to: '/transactions', icon: 'bi-arrow-left-right', label: 'Transactions' },
    { to: '/analytics',    icon: 'bi-bar-chart-fill',   label: 'Analytics'    },
    { to: '/budgets',      icon: 'bi-wallet2',          label: 'Budgets'      },
    { to: '/recurring',    icon: 'bi-arrow-repeat',     label: 'Recurring'    },
];

export default function Layout() {
    const { user, logout, toggleTheme, theme } = useAuth();
    const navigate = useNavigate();
    const [showAdd, setShowAdd]     = useState(false);
    const [sidebarOpen, setSidebar] = useState(false);
    const [refresh, setRefresh]     = useState(0);

    const handleLogout = () => { logout(); navigate('/login'); };
    const handleAdded  = () => { setShowAdd(false); setRefresh(r => r + 1); };
    const currentPage  = NAV.find(n => window.location.pathname.startsWith(n.to))?.label || 'Dashboard';

    return (
        <div className="app-layout">
            {sidebarOpen && (
                <div
                    onClick={() => setSidebar(false)}
                    style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:99, backdropFilter:'blur(4px)' }}
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">💰</div>
                    <div>
                        <div className="sidebar-brand-text">FinTrack</div>
                        <div className="sidebar-brand-sub">Money Manager</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">Navigation</div>
                    {NAV.map(n => (
                        <NavLink key={n.to} to={n.to} onClick={() => setSidebar(false)}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className={`bi ${n.icon}`}></i><span>{n.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', marginBottom:8 }}>
                        <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,var(--primary),#00b894)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0a0e1a', fontWeight:800, fontSize:14, flexShrink:0 }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ color:'var(--text)', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                            <div style={{ color:'var(--text-muted)', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="nav-item w-100" style={{ border:'none', background:'none', textAlign:'left', cursor:'pointer' }}>
                        <i className="bi bi-box-arrow-right"></i><span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <div className="main-content">
                <header className="topbar">
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <button className="btn btn-outline-secondary btn-sm d-md-none" onClick={() => setSidebar(true)} style={{ padding:'6px 10px' }}>
                            <i className="bi bi-list fs-5"></i>
                        </button>
                        <span className="topbar-title">{currentPage}</span>
                    </div>
                    <div className="topbar-actions">
                        <button onClick={toggleTheme} className="btn btn-outline-secondary btn-sm" style={{ padding:'7px 12px' }} title={theme==='dark'?'Light mode':'Dark mode'}>
                            <i className={`bi ${theme==='dark'?'bi-sun-fill':'bi-moon-fill'}`}></i>
                        </button>
                        <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm" style={{ padding:'7px 16px' }}>
                            <i className="bi bi-plus-lg"></i><span>Add</span>
                        </button>
                    </div>
                </header>
                <div className="page-body fade-in">
                    <Outlet key={refresh} context={{ refresh }} />
                </div>
            </div>

            {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
        </div>
    );
}
