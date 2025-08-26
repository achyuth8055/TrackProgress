import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import "../styles.css";

// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBxeq08SzPpFhhbjreasEwaFnJX3oTObrM",
  authDomain: "tracker-88ea9.firebaseapp.com",
  projectId: "tracker-88ea9",
  storageBucket: "tracker-88ea9.firebasestorage.app",
  messagingSenderId: "449768873579",
  appId: "1:449768873579:web:23b41598bcf347ed291b2e",
  measurementId: "G-3YCCMSXFTQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Regular email/password login (placeholder)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // For now, just navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Call your backend login
      await login(idToken);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button onClick={handleBack} className="back-btn" aria-label="Go back">
          ←
        </button>
        
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your learning journey.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              required
              className="form-input"
              aria-label="Email address"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              required
              className="form-input"
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={loading}
            aria-label="Sign in with email and password"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="auth-btn google"
          disabled={loading}
          aria-label="Sign in with Google"
        >
          <span className="google-icon">🔍</span>
          Continue with Google
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
