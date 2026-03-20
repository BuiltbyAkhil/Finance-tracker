import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout       from './components/Layout';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics    from './pages/Analytics';
import Budgets      from './pages/Budgets';
import Recurring    from './pages/Recurring';

const Protected = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner-border"></div></div>;
    return user ? children : <Navigate to="/login" />;
};
const Public = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/dashboard" /> : children;
};

const AppRoutes = () => (
    <Routes>
        <Route path="/login"    element={<Public><Login /></Public>} />
        <Route path="/register" element={<Public><Register /></Public>} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics"    element={<Analytics />} />
            <Route path="budgets"      element={<Budgets />} />
            <Route path="recurring"    element={<Recurring />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
);

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" toastOptions={{ duration:3000, style:{ borderRadius:'12px', fontFamily:'Inter,sans-serif', fontSize:'14px' }}} />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
