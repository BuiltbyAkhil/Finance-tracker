import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import api from '../api/api';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b'];
const fmt    = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', boxShadow:'var(--shadow-md)', fontSize:13 }}>
            <p style={{ fontWeight:700, marginBottom:4 }}>{label}</p>
            {payload.map((p,i) => <p key={i} style={{ color:p.color, margin:'2px 0' }}>{p.name}: {fmt(p.value)}</p>)}
        </div>
    );
};

export default function Analytics() {
    const [catData,     setCatData]     = useState([]);
    const [monthData,   setMonthData]   = useState([]);
    const [loading,     setLoading]     = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [cat, mon] = await Promise.all([
                    api.get('/transactions/charts/category'),
                    api.get('/transactions/charts/monthly'),
                ]);
                setCatData(cat.data);
                setMonthData(mon.data);
            } catch (_) {}
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

    const totalExpenses = catData.reduce((a,c) => a+c.value, 0);

    return (
        <div>
            <div style={{ marginBottom:28 }}>
                <h2 style={{ fontWeight:800, fontSize:24 }}>Analytics & Charts</h2>
                <p style={{ color:'var(--text-muted)', marginTop:4 }}>Visual overview of your financial data</p>
            </div>

            <div className="row g-3 mb-3">
                {/* Pie Chart - Expenses by Category */}
                <div className="col-lg-5">
                    <div className="card h-100">
                        <div className="card-header-custom">
                            <h6 style={{ fontWeight:700, margin:0 }}>🥧 Expenses by Category</h6>
                            <span style={{ fontSize:13, color:'var(--text-muted)' }}>This Month</span>
                        </div>
                        <div className="card-body-custom">
                            {catData.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">📊</div><p>No expense data yet</p></div>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => fmt(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ marginTop:16 }}>
                                        {catData.map((item, i) => (
                                            <div key={item.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <div style={{ width:12, height:12, borderRadius:3, background:COLORS[i%COLORS.length] }}></div>
                                                    <span style={{ fontSize:13, fontWeight:500 }}>{item.name}</span>
                                                </div>
                                                <div style={{ textAlign:'right' }}>
                                                    <span style={{ fontSize:13, fontWeight:700 }}>{fmt(item.value)}</span>
                                                    <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:6 }}>
                                                        {totalExpenses > 0 ? Math.round((item.value/totalExpenses)*100) : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bar Chart - Monthly Income vs Expense */}
                <div className="col-lg-7">
                    <div className="card h-100">
                        <div className="card-header-custom">
                            <h6 style={{ fontWeight:700, margin:0 }}>📊 Income vs Expenses</h6>
                            <span style={{ fontSize:13, color:'var(--text-muted)' }}>Last 6 Months</span>
                        </div>
                        <div className="card-body-custom">
                            {monthData.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">📈</div><p>No data available yet</p></div>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={monthData} margin={{ top:10, right:10, left:10, bottom:0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="month" tick={{ fontSize:12, fill:'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize:12, fill:'var(--text-muted)' }} tickFormatter={v => `₹${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize:13 }} />
                                        <Bar dataKey="income"  fill="#10b981" name="Income"  radius={[6,6,0,0]} />
                                        <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[6,6,0,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Chart - Balance Over Time */}
            <div className="card">
                <div className="card-header-custom">
                    <h6 style={{ fontWeight:700, margin:0 }}>📈 Balance Trend</h6>
                    <span style={{ fontSize:13, color:'var(--text-muted)' }}>Last 6 Months</span>
                </div>
                <div className="card-body-custom">
                    {monthData.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">📉</div><p>No data yet</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={monthData} margin={{ top:10, right:10, left:10, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="month" tick={{ fontSize:12, fill:'var(--text-muted)' }} />
                                <YAxis tick={{ fontSize:12, fill:'var(--text-muted)' }} tickFormatter={v => `₹${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize:13 }} />
                                <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} dot={{ fill:'#6366f1', r:5 }} name="Balance" />
                                <Line type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} dot={{ fill:'#10b981', r:4 }} strokeDasharray="5 5" name="Income" />
                                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ fill:'#ef4444', r:4 }} strokeDasharray="5 5" name="Expense" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
