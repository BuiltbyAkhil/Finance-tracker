import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [form, setForm]       = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back! 👋');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <div className="auth-logo">💰</div>
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-sub">Sign in to your FinTrack account</p>

                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-control"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Password</label>
                        <input
                            className="form-control"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            required
                        />
                    </div>
                    <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
                        {loading
                            ? <><span className="spinner-border spinner-border-sm"></span> Signing in…</>
                            : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
                        }
                    </button>
                </form>

                <p style={{ textAlign:'center', marginTop:24, color:'var(--text-muted)', fontSize:13.5 }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color:'var(--primary)', fontWeight:700, textDecoration:'none' }}>
                        Create one free →
                    </Link>
                </p>
            </div>
        </div>
    );
}
