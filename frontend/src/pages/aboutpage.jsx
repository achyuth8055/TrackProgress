import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <div className="page-bg-image"></div>
      <header className="page-header">
        <h2 className="logo"><Link to="/" style={{color: '#fff', textDecoration: 'none'}}>StudyTracker</Link></h2>
        <nav>
          <Link to="/contact" className="btn nav-btn">Contact</Link>
          <Link to="/login" className="btn nav-btn">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up Free</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="hero-content">
          <h1>About Us</h1>
          <p>We are dedicated to creating the best tools for students and developers to achieve their learning goals efficiently and collaboratively.</p>
        </div>
      </main>
    </div>
  );
}
