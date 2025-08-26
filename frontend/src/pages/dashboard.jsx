import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../App.js";
import { useAuth } from "../contexts/AuthContext.js";
import apiService from "../services/api.js";
import "../styles.css";

const CourseItem = ({ icon, name, progress, color }) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    // Navigate to topics page instead of non-existent course page
    navigate('/topics');
  };

  return (
    <div
      className="course-item"
      onClick={handleCourseClick}
      style={{
        cursor: "pointer",
        padding: "1rem",
        borderRadius: "var(--border-radius-md)",
        transition: "all var(--transition-speed) ease",
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCourseClick()}
      aria-label={`View ${name} course`}
    >
      <div
        className="course-icon"
        style={{
          background: `linear-gradient(145deg, ${color}, ${color}CC)`,
          color: "#fff",
          width: "56px",
          height: "56px",
          fontSize: "1.5rem",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--border-radius-md)"
        }}
      >
        {icon}
      </div>
      <div style={{ flexGrow: 1, marginLeft: "1.25rem" }}>
        <div className="course-info">
          <h3 style={{ fontSize: "clamp(1.1rem, 2vw, 1.2rem)", fontWeight: 600, letterSpacing: "-0.02em" }}>
            {name}
          </h3>
          <p style={{ fontSize: "clamp(0.9rem, 1.5vw, 0.95rem)", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {progress}% Complete
          </p>
        </div>
        <div className="progress-bar" style={{ marginTop: "0.75rem", height: "10px", background: "var(--bg-secondary)", borderRadius: "980px" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--accent-primary), #00B7FF)",
              borderRadius: "980px",
              transition: "width 0.5s ease-in-out",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({ title, dueDate, onStart }) => {
  return (
    <div
      className="task-item"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1rem",
        borderRadius: "var(--border-radius-sm)",
        marginBottom: "0.75rem",
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-color)",
        transition: "all var(--transition-speed) ease",
      }}
    >
      <div>
        <h3 style={{ fontSize: "clamp(0.95rem, 1.5vw, 1rem)", fontWeight: 500 }}>
          {title}
        </h3>
        <p style={{ fontSize: "clamp(0.85rem, 1.3vw, 0.9rem)", color: "var(--text-secondary)" }}>
          Due: {dueDate}
        </p>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => onStart(title)}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "var(--accent-primary)",
          color: "var(--accent-text)",
          border: "none",
          borderRadius: "var(--border-radius-sm)"
        }}
        aria-label={`Start ${title} task`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 3l14 9-14 9V3z" />
        </svg>
        Start
      </button>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div style={{ animation: 'pulse 2s infinite' }}>
    <div style={{ height: '20px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '1rem' }}></div>
    <div style={{ height: '60px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '1rem' }}></div>
    <div style={{ height: '60px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}></div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, getConnectionStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);
  const [error, setError] = useState(null);

  // Sample data - in a real app, this would come from an API
  const courses = [
    { name: "Data Structures & Algorithms", progress: 70, icon: "🧠", color: "#A9D5E5" },
    { name: "Core Java Concepts", progress: 45, icon: "☕", color: "#F4DDB5" },
    { name: "React Frontend Development", progress: 85, icon: "⚛️", color: "#C8B6E2" },
  ];

  const tasks = [
    { title: "Complete Binary Tree Assignment", dueDate: "Aug 28, 2025" },
    { title: "Java OOP Quiz", dueDate: "Aug 30, 2025" },
    { title: "React Hooks Practice", dueDate: "Sep 1, 2025" },
  ];

  // Check server connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        console.log('🔍 Checking server connection...');
        
        const health = await apiService.healthCheck();
        if (health) {
          setServerStatus('connected');
          console.log('✅ Server is healthy');
        } else {
          setServerStatus('disconnected');
          console.warn('⚠️ Server appears to be down');
        }
      } catch (err) {
        console.error('❌ Failed to check server status:', err);
        setServerStatus('error');
        setError('Unable to connect to server. Some features may not work properly.');
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  const handleViewAllCourses = () => {
    navigate("/topics"); // Navigate to existing topics page
  };

  const handleStartTask = (taskTitle) => {
    // Navigate to study plan page
    navigate("/studyplan");
  };

  const connectionStatus = getConnectionStatus();

  if (loading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <LoadingSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Dashboard">
      <div
        className="dashboard-grid"
        style={{
          gap: "2rem",
          padding: "1rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Connection Status Banner */}
        {serverStatus === 'disconnected' && (
          <div style={{ 
            gridColumn: '1 / -1', 
            background: 'rgba(255, 149, 0, 0.1)', 
            border: '1px solid rgba(255, 149, 0, 0.3)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1rem',
            color: 'var(--warning-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Working offline - Server connection unavailable</span>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ gridColumn: '1 / -1' }}>
            {error}
          </div>
        )}

        {/* Welcome Message */}
        <div style={{ 
          gridColumn: '1 / -1', 
          background: 'var(--bg-secondary)', 
          padding: '1.5rem', 
          borderRadius: 'var(--border-radius-lg)',
          marginBottom: '1rem'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Ready to continue your learning journey? Here's what's waiting for you.
          </p>
        </div>

        {/* Courses Card */}
        <div
          className="card"
          style={{
            padding: "2rem",
            boxShadow: "var(--shadow-md)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="card-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.4rem)", fontWeight: 700, letterSpacing: "-0.03em" }}>
              Continue Learning
            </h2>
            <button
              className="btn dashboard-btn"
              onClick={handleViewAllCourses}
              style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
              aria-label="View all courses"
            >
              View Topics
            </button>
          </div>
          <div className="card-body">
            {courses.map((course) => (
              <CourseItem key={course.name} {...course} />
            ))}
          </div>
        </div>

        {/* Tasks Card */}
        <div
          className="card"
          style={{
            padding: "2rem",
            boxShadow: "var(--shadow-md)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="card-header" style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.4rem)", fontWeight: 700, letterSpacing: "-0.03em" }}>
              Upcoming Tasks
            </h2>
          </div>
          <div className="card-body">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskItem 
                  key={task.title} 
                  {...task} 
                  onStart={handleStartTask}
                />
              ))
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: "clamp(0.95rem, 1.5vw, 1rem)" }}>
                No upcoming tasks. You're all caught up! 🎉
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          gridColumn: '1 / -1', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '1.5rem', 
            borderRadius: 'var(--border-radius-md)',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>3</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active Courses</div>
          </div>
          
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '1.5rem', 
            borderRadius: 'var(--border-radius-md)',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>67%</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Avg Progress</div>
          </div>
          
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '1.5rem', 
            borderRadius: 'var(--border-radius-md)',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>7</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Day Streak</div>
          </div>
        </div>

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            gridColumn: '1 / -1', 
            background: 'var(--bg-tertiary)', 
            padding: '1rem', 
            borderRadius: 'var(--border-radius-md)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '1rem'
          }}>
            <strong>Debug Info:</strong><br/>
            Server Status: {serverStatus}<br/>
            Connection: {connectionStatus.isOnline ? 'Online' : 'Offline'}<br/>
            Auth Token: {connectionStatus.hasToken ? 'Present' : 'Missing'}<br/>
            API URL: {connectionStatus.apiBaseUrl}
          </div>
        )}
      </div>
    </AppLayout>
  );
}