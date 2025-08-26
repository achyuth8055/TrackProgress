import React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../App.js";
import "../styles.css";

const CourseItem = ({ icon, name, progress, color }) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/course/${encodeURIComponent(name)}`);
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
        <div className="progress-bar" style={{ marginTop: "0.75rem", height: "10px" }}>
          <div
            style={{
              width: `${progress}%`,
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

const TaskItem = ({ title, dueDate }) => {
  const navigate = useNavigate();

  const handleStartTask = () => {
    navigate(`/task/${encodeURIComponent(title)}`);
  };

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
        onClick={handleStartTask}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
        aria-label={`Start ${title} task`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-text)"
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

export default function Dashboard() {
  const navigate = useNavigate();
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

  const handleViewAllCourses = () => {
    navigate("/courses");
  };

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
              className="btn btn-secondary"
              onClick={handleViewAllCourses}
              style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
              aria-label="View all courses"
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {courses.map((course) => (
              <CourseItem key={course.name} {...course} />
            ))}
          </div>
        </div>
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
              tasks.map((task) => <TaskItem key={task.title} {...task} />)
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: "clamp(0.95rem, 1.5vw, 1rem)" }}>
                No upcoming tasks. You're all caught up!
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}