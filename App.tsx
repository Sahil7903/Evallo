import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Teams from './pages/Teams';
import AuditLogs from './pages/AuditLogs';
import { User, AuthResponse } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for persisted session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nexushr_session_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (data: AuthResponse) => {
    setUser(data.user);
    localStorage.setItem('nexushr_session_user', JSON.stringify(data.user));
    localStorage.setItem('nexushr_token', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexushr_session_user');
    localStorage.removeItem('nexushr_token');
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Dashboard user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route 
          path="/employees" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Employees user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/teams" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Teams user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/logs" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <AuditLogs user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;