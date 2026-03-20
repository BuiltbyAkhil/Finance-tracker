import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user,    setUser]    = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [loading, setLoading] = useState(true);
    const [theme,   setTheme]   = useState(() => localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/me')
                .then(res => { setUser(res.data.user); if (res.data.user.darkMode) { setTheme('dark'); localStorage.setItem('theme','dark'); }})
                .catch(() => { localStorage.clear(); })
                .finally(() => setLoading(false));
        } else { setLoading(false); }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user',  JSON.stringify(res.data.user));
        setUser(res.data.user);
        if (res.data.user.darkMode) { setTheme('dark'); localStorage.setItem('theme','dark'); }
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user',  JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const logout = () => { localStorage.clear(); setUser(null); setTheme('light'); document.documentElement.setAttribute('data-theme','light'); };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        try { await api.put('/auth/preferences', { darkMode: newTheme === 'dark', currency: user?.currency || 'Rs' }); } catch {}
    };

    return (
        <AuthContext.Provider value={{ user, loading, theme, login, register, logout, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
