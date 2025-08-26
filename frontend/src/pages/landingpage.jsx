// frontend/src/pages/landingpage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Timer Component
const StudyTimer = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // pomodoro, short-break, long-break

  const modes = {
    pomodoro: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      // Auto switch modes
      if (mode === 'pomodoro') {
        setMode('short-break');
        setTime(modes['short-break']);
        setIsBreak(true);
      } else {
        setMode('pomodoro');
        setTime(modes['pomodoro']);
        setIsBreak(false);
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, time, mode, modes]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTime(modes[newMode]);
    setIsRunning(false);
    setIsBreak(newMode !== 'pomodoro');
  };

  const resetTimer = () => {
    setTime(modes[mode]);
    setIsRunning(false);
  };

  return (
    <div className="card shadow-lg border-0" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="card-header bg-primary text-white text-center">
        <h5 className="mb-0">
          <i className="fas fa-clock me-2"></i>
          Pomodoro Timer
        </h5>
      </div>
      <div className="card-body text-center">
        {/* Mode Selector */}
        <div className="btn-group mb-4" role="group">
          <button 
            className={`btn btn-sm ${mode === 'pomodoro' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleModeChange('pomodoro')}
          >
            Focus
          </button>
          <button 
            className={`btn btn-sm ${mode === 'short-break' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => handleModeChange('short-break')}
          >
            Short Break
          </button>
          <button 
            className={`btn btn-sm ${mode === 'long-break' ? 'btn-info' : 'btn-outline-info'}`}
            onClick={() => handleModeChange('long-break')}
          >
            Long Break
          </button>
        </div>

        {/* Timer Display */}
        <div className={`display-4 fw-bold mb-4 ${isBreak ? 'text-success' : 'text-primary'}`}>
          {formatTime(time)}
        </div>

        {/* Progress Ring */}
        <div className="position-relative d-inline-block mb-4">
          <svg width="120" height="120" className="position-absolute">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e9ecef"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={isBreak ? "#28a745" : "#007bff"}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (time / modes[mode])}`}
              transform="rotate(-90 60 60)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="position-absolute top-50 start-50 translate-middle">
            <i className={`fas fa-${isBreak ? 'coffee' : 'brain'} fa-2x ${isBreak ? 'text-success' : 'text-primary'}`}></i>
          </div>
        </div>

        {/* Controls */}
        <div className="d-flex gap-2 justify-content-center">
          <button
            className={`btn ${isRunning ? 'btn-warning' : 'btn-success'}`}
            onClick={() => setIsRunning(!isRunning)}
          >
            <i className={`fas fa-${isRunning ? 'pause' : 'play'} me-2`}></i>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={resetTimer}
          >
            <i className="fas fa-redo me-2"></i>
            Reset
          </button>
        </div>

        <div className="mt-3">
          <small className="text-muted">
            {isBreak ? 'Take a well-deserved break! 🎯' : 'Time to focus and be productive! 💪'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className={`navbar navbar-expand-lg fixed-top transition-all ${isScrolled ? 'navbar-dark bg-dark shadow' : 'navbar-dark'}`} 
           style={{ backgroundColor: isScrolled ? '#1a1a1a' : 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4" to="/">
            <i className="fas fa-graduation-cap me-2 text-primary"></i>
            StudyTracker
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/about">About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">Contact</Link>
              </li>
            </ul>
            
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light">
                <i className="fas fa-sign-in-alt me-2"></i>
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary">
                <i className="fas fa-rocket me-2"></i>
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-vh-100 d-flex align-items-center position-relative overflow-hidden" 
               style={{ 
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 paddingTop: '80px'
               }}>
        {/* Animated Background Elements */}
        <div className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
          <div className="position-absolute rounded-circle bg-white opacity-10" 
               style={{ width: '300px', height: '300px', top: '10%', left: '5%', animation: 'float 6s ease-in-out infinite' }}></div>
          <div className="position-absolute rounded-circle bg-white opacity-5" 
               style={{ width: '200px', height: '200px', top: '60%', right: '10%', animation: 'float 8s ease-in-out infinite reverse' }}></div>
          <div className="position-absolute rounded-circle bg-white opacity-8" 
               style={{ width: '150px', height: '150px', bottom: '20%', left: '15%', animation: 'float 7s ease-in-out infinite' }}></div>
        </div>

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="badge bg-light text-primary px-3 py-2 rounded-pill mb-4">
                <i className="fas fa-star me-2"></i>
                Track Your Learning Journey
              </div>
              
              <h1 className="display-3 fw-bold text-white mb-4">
                Master Your
                <span className="d-block" style={{ 
                  background: 'linear-gradient(45deg, #ffd89b, #19547b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent' 
                }}>
                  Learning Goals
                </span>
              </h1>
              
              <p className="lead text-white-50 mb-5 pe-lg-5">
                Transform your study habits with AI-powered tracking, personalized insights, 
                and goal-oriented learning paths. Join thousands of students already succeeding.
              </p>

              <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                <Link to="/signup" className="btn btn-primary btn-lg px-4 py-3 rounded-pill shadow">
                  <i className="fas fa-rocket me-2"></i>
                  Start Learning Today
                </Link>
                <Link to="/dashboard" className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill">
                  <i className="fas fa-play me-2"></i>
                  View Demo
                </Link>
              </div>

              {/* Stats */}
              <div className="row text-center">
                <div className="col-4">
                  <div className="card bg-white bg-opacity-10 border-0 text-white rounded-4">
                    <div className="card-body py-3">
                      <div className="fs-3 fw-bold">10k+</div>
                      <small className="text-white-50">Active Students</small>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card bg-white bg-opacity-10 border-0 text-white rounded-4">
                    <div className="card-body py-3">
                      <div className="fs-3 fw-bold">95%</div>
                      <small className="text-white-50">Success Rate</small>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card bg-white bg-opacity-10 border-0 text-white rounded-4">
                    <div className="card-body py-3">
                      <div className="fs-3 fw-bold">4.9★</div>
                      <small className="text-white-50">User Rating</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="text-center">
                <StudyTimer />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Boost Productivity Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" 
                  alt="Productivity" 
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="badge bg-primary text-white px-3 py-2 rounded-pill mb-4">
                <i className="fas fa-chart-line me-2"></i>
                Boost Your Productivity
              </div>
              
              <h2 className="display-5 fw-bold text-dark mb-4">
                Increase Your Study Efficiency by 
                <span className="text-primary">300%</span>
              </h2>
              
              <p className="lead text-muted mb-4">
                Our AI-powered study tracking system helps you identify patterns, 
                optimize your learning schedule, and achieve your goals faster than ever before.
              </p>

              <div className="row g-4 mb-5">
                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-primary text-white rounded-circle p-3">
                        <i className="fas fa-brain"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="fw-bold">Smart Analytics</h6>
                      <small className="text-muted">Track your progress with detailed insights</small>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-success text-white rounded-circle p-3">
                        <i className="fas fa-target"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="fw-bold">Goal Setting</h6>
                      <small className="text-muted">Set and achieve personalized goals</small>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-warning text-white rounded-circle p-3">
                        <i className="fas fa-clock"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="fw-bold">Time Management</h6>
                      <small className="text-muted">Built-in Pomodoro timer and scheduling</small>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-info text-white rounded-circle p-3">
                        <i className="fas fa-users"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="fw-bold">Study Groups</h6>
                      <small className="text-muted">Collaborate with fellow students</small>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/signup" className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow">
                <i className="fas fa-rocket me-2"></i>
                Let's Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Everything You Need to Succeed</h2>
            <p className="lead text-muted">Powerful features designed for modern learners</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-gradient text-white rounded-circle p-4 mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-rocket fs-2"></i>
                  </div>
                  <h5 className="fw-bold">Boost Productivity</h5>
                  <p className="text-muted">Increase study efficiency by up to 300% with smart tracking and AI insights.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-gradient text-white rounded-circle p-4 mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-bullseye fs-2"></i>
                  </div>
                  <h5 className="fw-bold">Achieve Goals</h5>
                  <p className="text-muted">Set and reach your learning objectives with personalized guidance and progress tracking.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body text-center p-4">
                  <div className="bg-info bg-gradient text-white rounded-circle p-4 mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-chart-line fs-2"></i>
                  </div>
                  <h5 className="fw-bold">Track Progress</h5>
                  <p className="text-muted">Visualize your improvement with detailed analytics and performance insights.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container text-center text-white">
          <h2 className="display-4 fw-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="lead mb-5">Join thousands of students who are already succeeding with StudyTracker</p>
          <Link to="/signup" className="btn btn-light btn-lg px-5 py-3 rounded-pill shadow">
            <i className="fas fa-rocket me-2 text-primary"></i>
            Get Started - It's Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5 className="fw-bold">
                <i className="fas fa-graduation-cap me-2 text-primary"></i>
                StudyTracker
              </h5>
              <p className="text-muted">Transform your learning journey with AI-powered insights.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <Link to="/about" className="text-light text-decoration-none me-3">About</Link>
              <Link to="/contact" className="text-light text-decoration-none me-3">Contact</Link>
              <Link to="/login" className="text-light text-decoration-none">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
}