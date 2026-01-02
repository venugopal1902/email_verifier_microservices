import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  Activity, 
  ShieldCheck,
  ServerOff,
  LayoutDashboard,
  Settings,
  Menu,
  X
} from 'lucide-react';
import FileUpload from './components/FileUpload.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import LoginPage from './pages/Login.jsx';
import StatusBadge from './components/StatusBadge.jsx';
/* ==========================================================================
   INSTRUCTIONS FOR LOCAL DEVELOPMENT:
   Split this file into the following structure:
   
   src/
   ├── api/
   │   └── client.js         <-- Copy "API Client" section
   ├── components/
   │   ├── Layout.jsx        <-- Copy "Layout Component" section
   │   ├── Navbar.jsx        <-- Copy "Navbar Component" section
   │   ├── Sidebar.jsx       <-- Copy "Sidebar Component" section
   │   └── FileUpload.jsx    <-- Copy "FileUpload Component" section
   ├── pages/
   │   ├── Login.jsx         <-- Copy "Login Page" section
   │   └── Dashboard.jsx     <-- Copy "Dashboard Page" section
   └── App.jsx               <-- Copy "Main App Component" section
   ==========================================================================
*/

// ==========================================
// 1. API CLIENT (src/api/client.js)
// ==========================================



// ==========================================
// 2. MOCK DATA (For Demo Purposes Only)
// ==========================================
const MOCK_USER = { username: 'admin', email: 'admin@company.com', plan: 'Enterprise' };
const MOCK_JOBS = [
  { job_id: 'job-123', original_filename: 'leads_dec_2025.csv', status: 'COMPLETED', progress: '100%', created_at: '2025-12-22' },
  { job_id: 'job-124', original_filename: 'newsletter_subscribers.csv', status: 'PROCESSING', progress: '45%', created_at: '2026-01-02' },
];

// ==========================================
// 3. COMPONENTS (src/components/...)
// ==========================================



// --- Sidebar.jsx ---

// --- StatusBadge.jsx ---


// --- FileUpload.jsx ---

// ==========================================
// 4. PAGES (src/pages/...)
// ==========================================

// --- Login.jsx ---

// --- Dashboard.jsx ---

// ==========================================
// 5. MAIN APP COMPONENT (src/App.jsx)
// ==========================================

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  // --- Auth Actions ---
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    if (demoMode) {
      setTimeout(() => {
        setUser(MOCK_USER);
        setToken("mock-token");
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const res = await apiClient.post('/api/auth/login/', { username, password });
      setToken(res.data.access);
      localStorage.setItem('access_token', res.data.access);
      // Fetch Profile
      const profileRes = await apiClient.get('/api/auth/me/', {
         headers: { Authorization: `Bearer ${res.data.access}` }
      });
      setUser(profileRes.data);
    } catch (err) {
      const msg = handleApiError(err);
      if (msg === "NETWORK_ERROR") {
        // Automatically suggest demo mode or show specific error
        setError("Backend Unreachable. Use Demo Mode?");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    setDemoMode(false);
    setError(null);
  };

  // Init Check
  useEffect(() => {
    if (token && !demoMode) {
      // Re-verify token or fetch profile
      // For simplified preview, we just assume valid if token exists, 
      // in real app we'd hit /api/auth/me
      if(!user) setUser({ username: 'returning_user', plan: 'Pro' }); 
    }
  }, []);

  return (
    <>
      {/* Global Error / Demo Mode Toast */}
      {(error || demoMode) && (
        <div className={`fixed top-0 left-0 right-0 p-2 text-center text-sm font-medium z-50 shadow-md ${demoMode ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
          {demoMode ? (
            <span className="flex items-center justify-center gap-2">
              <ServerOff size={16} /> 
              Demo Mode Active: Backend connections are simulated.
              <button onClick={logout} className="ml-2 underline hover:text-amber-950">Exit</button>
            </span>
          ) : (
             <span className="flex items-center justify-center gap-2">
              <AlertCircle size={16} /> {error} 
              {error.includes("Backend") && (
                <button 
                  onClick={() => { setDemoMode(true); setError(null); }}
                  className="ml-2 font-bold underline hover:text-red-950"
                >
                  Switch to Demo Mode
                </button>
              )}
            </span>
          )}
        </div>
      )}

      {/* Routing Logic (Simplified) */}
      {!token ? (
        <LoginPage 
          onLogin={login} 
          loading={loading} 
          error={error} 
          setDemoMode={() => { setDemoMode(true); setError(null); }} 
        />
      ) : (
        <DashboardPage 
          user={user} 
          api={apiClient} 
          onLogout={logout} 
          demoMode={demoMode} 
        />
      )}
    </>
  );
}