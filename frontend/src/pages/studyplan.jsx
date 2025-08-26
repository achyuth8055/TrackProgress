import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../App.js";
import AiAssistentWidget from "./aiassistentWidget.jsx"
import "../styles.css";

export default function StudyPlan() {
  const navigate = useNavigate();
  const [confidence, setConfidence] = useState(60);
  const [tasks, setTasks] = useState([
    { id: "task1", text: "Understand the core concept of two pointers.", completed: true },
    { id: "task2", text: "Implement basic examples (e.g., reversing an array).", completed: true },
    { id: "task3", text: "Solve 5 easy problems with arrays on LeetCode.", completed: false },
    { id: "task4", text: "Practice common patterns (fast/slow pointers).", completed: false },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (tasks.filter((task) => task.completed).length / tasks.length) * 100
  );

  // Handle task completion toggle
  const handleToggleTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle adding a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: `task${prevTasks.length + 1}`, text: newTaskText, completed: false },
      ]);
      setNewTaskText("");
      setIsModalOpen(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <AppLayout pageTitle="Study Plan: Two Pointers">
      <div className="study-plan-layout">
        <div className="card study-plan-card">
          <div className="card-header">
            <h2>Learning Path</h2>
            <div className="card-actions">
              <button
                onClick={handleBack}
                className="btn study-plan-btn-secondary icon-btn"
                aria-label="Go back"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn study-plan-btn-primary"
                aria-label="Add new task"
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
                  className="icon"
                >
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                Add Task
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="progress-text">Progress: {completionPercentage}% Complete</p>
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <input
                  type="checkbox"
                  id={task.id}
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  aria-label={`Toggle completion for ${task.text}`}
                />
                <label
                  htmlFor={task.id}
                  className={`task-label ${task.completed ? "completed" : ""}`}
                >
                  {task.text}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="card confidence-slider">
          <div className="card-header">
            <h2>Confidence Level</h2>
          </div>
          <div className="card-body">
            <p className="confidence-text">{confidence}% Confident</p>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="confidence-range"
              aria-label={`Set confidence level to ${confidence}%`}
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className="input-group">
                <label htmlFor="new-task">Task Description</label>
                <textarea
                  id="new-task"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Enter task description"
                  required
                  className="task-input"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn study-plan-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Cancel adding task"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn study-plan-btn-primary"
                  aria-label="Add new task"
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
                    className="icon"
                  >
                    <path d="M12 5v14m-7-7h14" />
                  </svg>
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}