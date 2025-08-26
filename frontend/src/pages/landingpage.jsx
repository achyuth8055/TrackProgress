import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

// SVG icon for the CTA button
const ArrowIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="icon"
  >
    <path
      d="M9.78125 3.65625L14.625 8.5L9.78125 13.3438"
      stroke="var(--accent-text)"
      strokeWidth="1.8"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.875 8.5H14.0156"
      stroke="var(--accent-text)"
      strokeWidth="1.8"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="page-wrapper">
      <div className="page-bg-image"></div>
      <div className="page-bg-text">&lt;track/&gt;</div>
      <header className="page-header">
        <h2 className="logo">&lt;track /&gt;</h2>
        <nav className="header-nav">
          <Link to="/about" className="btn landing-btn-secondary">About</Link>
          <Link to="/contact" className="btn landing-btn-secondary">Contact</Link>
          <Link to="/login" className="btn landing-btn-secondary">Sign In</Link>
          <Link to="/signup" className="btn landing-btn-primary">Sign Up Free</Link>
        </nav>
      </header>
      <main className="page-main">
        <div className="hero-content">
          <h1 className="hero-title">Your Learning Journey!</h1>
          <p className="hero-subtitle">
            & your Progress Everyday!
          </p>
          <Link to="/dashboard" className="btn landing-cta-button">
            Get Started For Free
            <ArrowIcon />
          </Link>
        </div>
      </main>
    </div>
  );
}