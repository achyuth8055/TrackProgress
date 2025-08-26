import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import "../styles.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, mockLogin, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState("");

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (localError) setLocalError("");
    if (error) clearError();
  };

  // Regular email/password login - Development mock implementation
  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    // Basic validation
    if (!formData.email || !formData.password) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (!formData.email.includes('@')) {
      setLocalError("Please enter a valid email address");
      return;
    }

    try {
      console.log('🔐 Attempting mock login with email:', formData.email);
      
      // For development, use email as mock token
      await mockLogin(formData.email);
      
      console.log('✅ Login successful, redirecting to dashboard');
      navigate("/dashboard");
    } catch (err) {
      console.error('❌ Login failed:', err);
      setLocalError(err.message || "Login failed. Please try again.");
    }
  };

  // Google Sign-In - Placeholder for real Firebase implementation
  const handleGoogleSignIn = async () => {
    setLocalError("");
    clearError();

    try {
      console.log('🔐 Attempting Google Sign-In...');
      
      // TODO: Implement real Google OAuth with Firebase
      // For now, show instructions for development
      const useDevLogin = window.confirm(
        "Google Sign-In not yet fully implemented.\n\n" +
        "For development testing:\n" +
        "- Click 'OK' to use development login\n" +
        "- Click 'Cancel' to implement Firebase first\n\n" +
        "Would you like to use the development login?"
      );

      if (useDevLogin) {
        await mockLogin('google.user@example.com');
        navigate("/dashboard");
      } else {
        setLocalError(
          "To implement Google Sign-In:\n" +
          "1. Set up Firebase project\n" +
          "2. Add Firebase config to frontend\n" +
          "3. Add serviceAccountKey.json to backend\n" +
          "4. Update Firebase configuration"
        );
      }
    } catch (err) {
      console.error('❌ Google sign-in failed:', err);
      setLocalError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Display error message
  const displayError = localError || error;

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <button
          onClick={handleBack}
          className="btn btn-back-good"
          aria-label="Go back"
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue your learning journey.</p>
        </div>

        {displayError && (
          <div className="error-message">
            {displayError.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
              disabled={loading}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              required 
              disabled={loading}
              placeholder="Enter your password"
              autoComplete="current-password"
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary auth-button"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" fill="none"/>
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={{ 
          margin: "1rem 0", 
          textAlign: "center", 
          color: "var(--text-secondary)" 
        }}>
          or
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="btn auth-button"
          disabled={loading}
          style={{
            width: "100%",
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Signing In..." : "Continue with Google"}
        </button>

        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            marginTop: "1rem", 
            padding: "0.75rem", 
            background: "var(--bg-tertiary)", 
            borderRadius: "var(--border-radius-sm)", 
            fontSize: "0.85rem",
            color: "var(--text-secondary)"
          }}>
            <strong>Development Mode:</strong><br/>
            Use any email format for testing.<br/>
            Backend will create a mock user account.
          </div>
        )}

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}