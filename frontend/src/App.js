import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.js";

// Import all page components
import LandingPage from "./pages/landingpage.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Topics from "./pages/topics.jsx";
import StudyPlan from "./pages/studyplan.jsx";
import StudyGroupsPage from "./pages/studygroup.jsx";
import QuickAnswer from "./pages/quickanswer.jsx";
import AboutPage from "./pages/aboutpage.jsx";
import ContactPage from "./pages/contactpage.jsx";
import AIAssistantWidget from "./pages/aiassistentWidget.jsx";

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// --- Reusable App Layout Component ---
export const AppLayout = ({ pageTitle, children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { path: "/dashboard", icon: "🏠", label: "Dashboard" },
    { path: "/studyplan", icon: "🎯", label: "Today's Target" },
    { path: "/topics", icon: "📚", label: "Yet 2 Complete" },
    { path: "/studygroups", icon: "👥", label: "Group Discussion" },
    { path: "/quickanswer", icon: "💡", label: "Quick Answer" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <header className="sidebar-header">
          <Link to="/" style={{textDecoration: 'none', color: 'var(--text-primary)'}}>
            <div className="logo-container">
              <div className="logo-icon">📚</div>
              <span className="logo-text">StudyTracker</span>
            </div>
          </Link>
        </header>
        <nav className="sidebar-nav">
          <ul>
            {navLinks.map(link => (
              <li key={link.path} className={location.pathname.startsWith(link.path) ? "active" : ""}>
                <Link to={link.path}>
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                  <div className="nav-indicator"></div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button onClick={toggleTheme} className="theme-toggle">
            <span className="nav-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>Switch Theme</span>
          </button>
          <button onClick={handleLogout} className="theme-toggle" style={{ marginTop: '0.5rem', background: 'var(--warning-color)' }}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="main-content-wrapper">
        <header className="content-header">
          <h1>{pageTitle}</h1>
          <div className="header-actions">
            <div className="user-profile">
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                ) : (
                  '👤'
                )}
              </div>
              <span className="user-name">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>
        <main className="content-area">
          {children}
        </main>
      </div>
      <AIAssistantWidget />
    </div>
  );
};

// --- Main App Router ---
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/topics" element={
        <ProtectedRoute>
          <Topics />
        </ProtectedRoute>
      } />
      <Route path="/studyplan" element={
        <ProtectedRoute>
          <StudyPlan />
        </ProtectedRoute>
      } />
      <Route path="/studygroups" element={
        <ProtectedRoute>
          <StudyGroupsPage />
        </ProtectedRoute>
      } />
      <Route path="/quickanswer" element={
        <ProtectedRoute>
          <QuickAnswer />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;