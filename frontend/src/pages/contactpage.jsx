import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

export default function ContactPage() {
  return (
    <div className="page-wrapper">
      <div className="page-bg-image"></div>
      <header className="page-header">
        <h2 className="logo"><Link to="/" style={{color: '#fff', textDecoration: 'none'}}>StudyTracker</Link></h2>
        <nav>
          <Link to="/about" className="btn nav-btn">About</Link>
          <Link to="/login" className="btn nav-btn">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up Free</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="hero-content">
          <h1>Contact Us</h1>
          <p>Have questions or feedback? Reach out to us at <a href="mailto:contact@studytracker.dev">contact@studytracker.dev</a></p>
        </div>
      </main>
    </div>
  );
}
