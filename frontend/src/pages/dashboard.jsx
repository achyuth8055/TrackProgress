import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../App.js";
import { useAuth } from "../contexts/AuthContext.js";
import apiService from "../services/api.js";
import "../styles.css";

const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority?.toLowerCase() || 'medium',
    category: task.category || 'general'
  });

  const handleSave = async () => {
    try {
      await onEdit(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority?.toLowerCase() || 'medium',
      category: task.category || 'general'
    });
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className="task-item editing">
        <div className="task-edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Task title"
            className="task-title-input"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Task description (optional)"
            className="task-description-input"
            rows="2"
          />
          <div className="task-edit-controls">
            <select
              value={editData.priority}
              onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
              className="priority-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="text"
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              placeholder="Category"
              className="category-input"
            />
          </div>
          <div className="task-edit-actions">
            <button onClick={handleSave} className="btn btn-primary btn-sm">Save</button>
            <button onClick={handleCancel} className="btn btn-secondary btn-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-main">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="task-checkbox"
        />
        <div className="task-content">
          <h4 className="task-title">{task.title}</h4>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-meta">
            <span 
              className="task-priority"
              style={{ color: getPriorityColor(task.priority) }}
            >
              {task.priority?.toUpperCase() || 'MEDIUM'}
            </span>
            <span className="task-category">{task.category}</span>
            {task.dueDate && (
              <span className={`task-due-date ${formatDate(task.dueDate) === 'Overdue' ? 'overdue' : ''}`}>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="task-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="btn btn-ghost btn-sm"
          aria-label="Edit task"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn btn-ghost btn-sm"
          aria-label="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    setLoading(true);
    try {
      await onAdd(taskData);
      setTaskData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="What do you need to do?"
              required
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Additional details (optional)"
              rows="3"
              disabled={loading}
            />
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="input-group">
              <label htmlFor="task-category">Category</label>
              <input
                id="task-category"
                type="text"
                value={taskData.category}
                onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
                placeholder="e.g., Work, Study, Personal"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              disabled={loading}
            />
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !taskData.title.trim()}
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="loading-skeleton">
    <div className="skeleton-item"></div>
    <div className="skeleton-item"></div>
    <div className="skeleton-item"></div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  });

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Filter tasks when filter changes
  useEffect(() => {
    filterTasks();
  }, [tasks, filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        query GetTasks($filter: TaskFilter) {
          tasks(filter: $filter, limit: 100) {
            id
            title
            description
            completed
            priority
            dueDate
            category
            tags
            createdAt
          }
          taskStats {
            total
            completed
            pending
            completionRate
          }
        }
      `;

      const data = await apiService.graphqlRequest(query, { filter: 'ALL' });
      setTasks(data.tasks || []);
      setStats(data.taskStats || { total: 0, completed: 0, pending: 0, completionRate: 0 });
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    switch (filter) {
      case 'PENDING':
        filtered = tasks.filter(task => !task.completed);
        break;
      case 'COMPLETED':
        filtered = tasks.filter(task => task.completed);
        break;
      case 'TODAY':
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        filtered = tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= startOfToday && dueDate <= endOfToday;
        });
        break;
      case 'OVERDUE':
        const now = new Date();
        filtered = tasks.filter(task => {
          if (!task.dueDate || task.completed) return false;
          return new Date(task.dueDate) < now;
        });
        break;
      default:
        filtered = tasks;
    }

    setFilteredTasks(filtered);
  };

  const handleAddTask = async (taskData) => {
    try {
      const mutation = `
        mutation CreateTask($input: TaskInput!) {
          createTask(input: $input) {
            id
            title
            description
            completed
            priority
            dueDate
            category
            tags
            createdAt
          }
        }
      `;

      const input = {
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority.toUpperCase(),
        category: taskData.category,
        dueDate: taskData.dueDate || null
      };

      const data = await apiService.graphqlRequest(mutation, { input });
      setTasks(prev => [data.createTask, ...prev]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      }));

    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const mutation = `
        mutation ToggleTaskComplete($id: ID!) {
          toggleTaskComplete(id: $id) {
            id
            title
            description
            completed
            priority
            dueDate
            category
            tags
            createdAt
          }
        }
      `;

      const data = await apiService.graphqlRequest(mutation, { id: taskId });
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? data.toggleTaskComplete : task
        )
      );

      // Update stats
      const updatedTask = data.toggleTaskComplete;
      setStats(prev => ({
        ...prev,
        completed: updatedTask.completed ? prev.completed + 1 : prev.completed - 1,
        pending: updatedTask.completed ? prev.pending - 1 : prev.pending + 1,
        completionRate: prev.total > 0 ? Math.round(((updatedTask.completed ? prev.completed + 1 : prev.completed - 1) / prev.total) * 100) : 0
      }));

    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleEditTask = async (taskId, updateData) => {
    try {
      const mutation = `
        mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
          updateTask(id: $id, input: $input) {
            id
            title
            description
            completed
            priority
            dueDate
            category
            tags
            createdAt
          }
        }
      `;

      const input = {
        title: updateData.title,
        description: updateData.description || null,
        priority: updateData.priority.toUpperCase(),
        category: updateData.category
      };

      const data = await apiService.graphqlRequest(mutation, { id: taskId, input });
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? data.updateTask : task
        )
      );

    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const mutation = `
        mutation DeleteTask($id: ID!) {
          deleteTask(id: $id)
        }
      `;

      await apiService.graphqlRequest(mutation, { id: taskId });
      
      const taskToDelete = tasks.find(task => task.id === taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        completed: taskToDelete?.completed ? prev.completed - 1 : prev.completed,
        pending: taskToDelete?.completed ? prev.pending : prev.pending - 1
      }));

    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getFilterCounts = () => {
    const all = tasks.length;
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    const today = tasks.filter(t => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      const today = new Date();
      return taskDate.toDateString() === today.toDateString();
    }).length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { all, pending, completed, today, overdue };
  };

  const filterCounts = getFilterCounts();

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
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p>Here's what you have on your plate today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Task Management Section */}
        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Your Tasks</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              + Add Task
            </button>
          </div>

          {/* Task Filters */}
          <div className="task-filters">
            <button
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All ({filterCounts.all})
            </button>
            <button
              className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setFilter('PENDING')}
            >
              Pending ({filterCounts.pending})
            </button>
            <button
              className={`filter-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setFilter('COMPLETED')}
            >
              Completed ({filterCounts.completed})
            </button>
            <button
              className={`filter-btn ${filter === 'TODAY' ? 'active' : ''}`}
              onClick={() => setFilter('TODAY')}
            >
              Due Today ({filterCounts.today})
            </button>
            {filterCounts.overdue > 0 && (
              <button
                className={`filter-btn overdue ${filter === 'OVERDUE' ? 'active' : ''}`}
                onClick={() => setFilter('OVERDUE')}
              >
                Overdue ({filterCounts.overdue})
              </button>
            )}
          </div>

          {/* Task List */}
          <div className="task-list">
            {error ? (
              <div className="error-message">
                {error}
                <button onClick={loadTasks} className="btn btn-secondary btn-sm">
                  Try Again
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No tasks found</h3>
                <p>
                  {filter === 'ALL' 
                    ? "You don't have any tasks yet. Create your first task to get started!" 
                    : `No tasks match the "${filter.toLowerCase()}" filter.`
                  }
                </p>
                {filter === 'ALL' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                  >
                    Create Your First Task
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button 
              onClick={() => navigate("/studyplan")} 
              className="btn btn-outline"
            >
              📅 Study Plan
            </button>
            <button 
              onClick={() => navigate("/topics")} 
              className="btn btn-outline"
            >
              📚 Topics
            </button>
            <button 
              onClick={() => navigate("/quickanswer")} 
              className="btn btn-outline"
            >
              💡 Quick Help
            </button>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />
    </AppLayout>
  );
}