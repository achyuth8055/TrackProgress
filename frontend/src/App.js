// frontend/src/App.js
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
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>Loading your dashboard...</div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// --- Theme Toggle Component ---
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  return (
    <button 
      onClick={toggleTheme} 
      className="btn btn-outline-secondary"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'} me-2`}></i>
      {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

// --- Sidebar Navigation Component ---
const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { path: "/dashboard", icon: "fas fa-home", label: "Dashboard" },
    { path: "/studyplan", icon: "fas fa-bullseye", label: "Today's Target" },
    { path: "/topics", icon: "fas fa-book", label: "Yet 2 Complete" },
    { path: "/studygroups", icon: "fas fa-users", label: "Group Discussion" },
    { path: "/quickanswer", icon: "fas fa-lightbulb", label: "Quick Answer" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" 
          style={{ zIndex: 1040 }} 
          onClick={onToggle}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`position-fixed top-0 start-0 h-100 bg-body-secondary border-end shadow-sm d-flex flex-column transition-all ${
        isOpen ? 'translate-x-0' : 'translate-x-n100'
      } d-lg-block`} 
      style={{ 
        width: '280px', 
        zIndex: 1041,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-bottom">
          <Link to="/" className="text-decoration-none">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded-3 p-2 me-3">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div>
                <div className="fw-bold fs-5 text-body">StudyTracker</div>
                <small className="text-muted">AI-Powered Learning</small>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-3">
          <div className="list-group list-group-flush">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 ${
                  location.pathname.startsWith(link.path) ? 'active' : ''
                }`}
              >
                <i className={`${link.icon} me-3`}></i>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile & Actions */}
        <div className="p-3 border-top">
          {user && (
            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="User" 
                    className="rounded-circle"
                    style={{ width: '40px', height: '40px' }}
                  />
                ) : (
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold small">{user.name}</div>
                <div className="text-muted small">{user.email}</div>
              </div>
            </div>
          )}
          
          <div className="d-grid gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  );
};

// --- Logout Button Component ---
const LogoutButton = () => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className="btn btn-outline-danger"
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Logging out...
        </>
      ) : (
        <>
          <i className="fas fa-sign-out-alt me-2"></i>
          Logout
        </>
      )}
    </button>
  );
};

// --- Mobile Navigation Toggle ---
const MobileNavToggle = ({ onClick }) => (
  <button 
    className="btn btn-outline-secondary d-lg-none"
    onClick={onClick}
    style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 1042 }}
  >
    <i className="fas fa-bars"></i>
  </button>
);

// --- Reusable App Layout Component ---
export const AppLayout = ({ pageTitle, children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="d-flex min-vh-100">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <MobileNavToggle onClick={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: window.innerWidth >= 992 ? '280px' : '0' }}>
        {/* Header */}
        <header className="bg-body-tertiary border-bottom shadow-sm sticky-top">
          <div className="container-fluid py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-outline-secondary me-3 d-lg-none"
                  onClick={toggleSidebar}
                >
                  <i className="fas fa-bars"></i>
                </button>
                <h1 className="h4 mb-0">{pageTitle}</h1>
              </div>
              
              <div className="d-flex align-items-center">
                {/* User info for larger screens */}
                <div className="d-none d-md-flex align-items-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="User" 
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px' }}
                    />
                  ) : (
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                         style={{ width: '32px', height: '32px' }}>
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <span className="fw-semibold">{user?.name || 'User'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow-1">
          {children}
        </main>
      </div>

      {/* AI Assistant Widget */}
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
  useEffect(() => {
    // Initialize Bootstrap tooltips and popovers
    if (window.bootstrap) {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl));
      
      return () => {
        tooltipList.forEach(tooltip => tooltip.dispose());
      };
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;