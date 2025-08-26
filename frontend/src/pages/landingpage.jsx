import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

// Modern SVG icons
const ArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="icon arrow-icon"
  >
    <path
      d="M5 12h14m-7-7l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FeatureIcon = ({ icon }) => (
  <div className="feature-icon">
    {icon}
  </div>
);

const AnimatedBackground = () => (
  <div className="animated-background">
    <div className="floating-shapes">
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>
      <div className="shape shape-4"></div>
    </div>
  </div>
);

const StatCard = ({ number, label, delay }) => (
  <div 
    className="stat-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Cycle through features
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: "📚",
      title: "Smart Study Tracking",
      description: "AI-powered progress monitoring"
    },
    {
      icon: "🎯",
      title: "Goal-Oriented Learning",
      description: "Personalized study plans"
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description: "Detailed performance insights"
    }
  ];

  return (
    <div className="modern-page-wrapper">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="modern-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">📚</div>
            <span className="logo-text">StudyTracker</span>
          </div>
          
          <nav className="header-nav">
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary-modern">
                Get Started Free
                <ArrowIcon />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="modern-main">
        <div className="hero-section">
          <div className={`hero-content ${isVisible ? 'fade-in' : ''}`}>
            <div className="hero-badge">
              <span className="badge-text">✨ Track Your Learning Journey</span>
            </div>
            
            <h1 className="hero-title">
              Master Your
              <span className="gradient-text"> Learning Goals</span>
            </h1>
            
            <p className="hero-description">
              Transform your study habits with AI-powered tracking, personalized insights, 
              and goal-oriented learning paths. Join thousands of students already succeeding.
            </p>

            <div className="cta-section">
              <Link to="/signup" className="btn btn-cta-primary">
                Start Learning Today
                <ArrowIcon />
              </Link>
              <Link to="/dashboard" className="btn btn-cta-secondary">
                <span className="play-icon">▶</span>
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="stats-container">
              <StatCard number="10k+" label="Active Students" delay={100} />
              <StatCard number="95%" label="Success Rate" delay={200} />
              <StatCard number="4.9★" label="User Rating" delay={300} />
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="feature-showcase">
            <div className="feature-cards">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`feature-card ${currentFeature === index ? 'active' : ''}`}
                >
                  <FeatureIcon icon={feature.icon} />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <section className="benefits-section">
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🚀</div>
              <h3>Boost Productivity</h3>
              <p>Increase study efficiency by up to 300% with smart tracking</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <h3>Achieve Goals</h3>
              <p>Set and reach your learning objectives with guided paths</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📈</div>
              <h3>Track Progress</h3>
              <p>Visualize your improvement with detailed analytics</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Learning?</h2>
          <p>Join thousands of students who are already succeeding with StudyTracker</p>
          <Link to="/signup" className="btn btn-cta-large">
            Get Started - It's Free!
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}