import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Account created! 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <div className="auth-logo">🚀</div>
                <h1 className="auth-title">Get Started Free</h1>
                <p className="auth-sub">Create your Finance Tracker account</p>
                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input className="form-control" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Confirm Password</label>
                        <input className="form-control" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
                    </div>
                    <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : <><i className="bi bi-person-plus me-2"></i>Create Account</>}
                    </button>
                </form>
                <p style={{ textAlign:'center', marginTop:20, color:'var(--text-muted)', fontSize:14 }}>
                    Already have an account? <Link to="/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
