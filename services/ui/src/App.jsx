import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import { apiClient, handleApiError } from './api/client';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Auth Logic ---
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Token
      const res = await apiClient.post('/api/auth/login/', { username, password });
      const newToken = res.data.access;
      
      // 2. Save Token
      localStorage.setItem('access_token', newToken);
      setToken(newToken);
      
      // 3. Fetch User Profile immediately
      // We don't await here to let the UI transition, but we trigger the fetch
      fetchUser();
    } catch (err) {
      console.error("Login failed", err);
      const msg = handleApiError(err);
      setError(msg);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const res = await apiClient.get('/api/auth/me/');
      setUser(res.data);
    } catch (err) {
      console.log("Failed to fetch user, logging out.");
      // If fetching user fails (e.g. 401), we should log out
      logout();
    }
  };

  // --- Effects ---
  
  // Listen for auto-logout events from api client (triggered on 401)
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  // Verify token on mount
  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  // --- Render ---
  return (
    <>
      {/* Global Error Toast */}
      {error && (
        <div className="fixed top-0 left-0 right-0 p-2 text-center text-sm font-medium z-50 bg-red-100 text-red-800 flex justify-center gap-2">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError(null)} className="ml-4 font-bold">X</button>
        </div>
      )}

      {/* Routing Logic */}
      {!token ? (
        <LoginPage onLogin={login} loading={loading} error={error} />
      ) : (
        <DashboardPage user={user} api={apiClient} onLogout={logout} />
      )}
    </>
  );
}