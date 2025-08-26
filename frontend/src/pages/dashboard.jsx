// frontend/src/pages/dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../App.js";
import { useAuth } from "../contexts/AuthContext.js";
import apiService from "../services/api.js";

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

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', class: 'text-danger' };
    if (diffDays === 0) return { text: 'Today', class: 'text-warning' };
    if (diffDays === 1) return { text: 'Tomorrow', class: 'text-info' };
    if (diffDays <= 7) return { text: `${diffDays} days`, class: 'text-muted' };
    return { text: date.toLocaleDateString(), class: 'text-muted' };
  };

  if (isEditing) {
    return (
      <div className="card mb-3 border-primary">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-control"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              placeholder="Task title"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="2"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Task description (optional)"
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                placeholder="Category"
              />
            </div>
          </div>
          <div className="d-flex gap-2">
            <button onClick={handleSave} className="btn btn-primary btn-sm">
              <i className="fas fa-save me-2"></i>Save
            </button>
            <button onClick={handleCancel} className="btn btn-secondary btn-sm">
              <i className="fas fa-times me-2"></i>Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dueDate = formatDate(task.dueDate);

  return (
    <div className={`card mb-3 ${task.completed ? 'opacity-75' : ''}`}>
      <div className="card-body">
        <div className="d-flex align-items-start">
          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
            />
          </div>
          <div className="flex-grow-1">
            <h6 className={`card-title mb-1 ${task.completed ? 'text-decoration-line-through' : ''}`}>
              {task.title}
            </h6>
            {task.description && (
              <p className="card-text small text-muted mb-2">{task.description}</p>
            )}
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className={`badge bg-${getPriorityBadge(task.priority)}`}>
                {task.priority?.toUpperCase() || 'MEDIUM'}
              </span>
              <span className="badge bg-light text-dark">{task.category}</span>
              {dueDate && (
                <span className={`small ${dueDate.class}`}>
                  <i className="fas fa-calendar-alt me-1"></i>
                  {dueDate.text}
                </span>
              )}
            </div>
          </div>
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={() => setIsEditing(true)}>
                  <i className="fas fa-edit me-2"></i>Edit
                </button>
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => onDelete(task.id)}>
                  <i className="fas fa-trash me-2"></i>Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
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
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-plus-circle me-2 text-primary"></i>
              Add New Task
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  placeholder="What do you need to do?"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Additional details (optional)"
                  disabled={loading}
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={taskData.category}
                    onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
                    placeholder="e.g., Work, Study, Personal"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !taskData.title.trim()}>
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Add Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="container-fluid">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="card mb-3">
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
            <span className="placeholder col-4"></span>
            <span className="placeholder col-4"></span>
            <span className="placeholder col-6"></span>
          </div>
        </div>
      </div>
    ))}
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
        <div className="container-fluid py-4">
          <LoadingSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="container-fluid py-4">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="h3 mb-0">
                  Welcome back, {user?.name || 'Student'}! 
                  <span className="ms-2">👋</span>
                </h1>
                <p className="text-muted mb-0">Here's what you have on your plate today.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <i className="fas fa-plus me-2"></i>
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-md-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <div className="display-6 mb-2">📋</div>
                <div className="h2 mb-0">{stats.total}</div>
                <div className="text-muted">Total Tasks</div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <div className="display-6 mb-2">✅</div>
                <div className="h2 mb-0 text-success">{stats.completed}</div>
                <div className="text-muted">Completed</div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <div className="display-6 mb-2">⏳</div>
                <div className="h2 mb-0 text-warning">{stats.pending}</div>
                <div className="text-muted">Pending</div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <div className="display-6 mb-2">📊</div>
                <div className="h2 mb-0 text-info">{stats.completionRate}%</div>
                <div className="text-muted">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Management Section */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">
                    <i className="fas fa-tasks me-2 text-primary"></i>
                    Your Tasks
                  </h5>
                </div>
              </div>

              <div className="card-body">
                {/* Task Filters */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <button
                    className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('ALL')}
                  >
                    All ({filterCounts.all})
                  </button>
                  <button
                    className={`btn btn-sm ${filter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setFilter('PENDING')}
                  >
                    Pending ({filterCounts.pending})
                  </button>
                  <button
                    className={`btn btn-sm ${filter === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setFilter('COMPLETED')}
                  >
                    Completed ({filterCounts.completed})
                  </button>
                  <button
                    className={`btn btn-sm ${filter === 'TODAY' ? 'btn-info' : 'btn-outline-info'}`}
                    onClick={() => setFilter('TODAY')}
                  >
                    Due Today ({filterCounts.today})
                  </button>
                  {filterCounts.overdue > 0 && (
                    <button
                      className={`btn btn-sm ${filter === 'OVERDUE' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setFilter('OVERDUE')}
                    >
                      Overdue ({filterCounts.overdue})
                    </button>
                  )}
                </div>

                {/* Task List */}
                {error ? (
                  <div className="alert alert-danger d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <div>
                      {error}
                      <button onClick={loadTasks} className="btn btn-sm btn-outline-danger ms-3">
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-1 mb-3">📝</div>
                    <h4>No tasks found</h4>
                    <p className="text-muted mb-4">
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
                        <i className="fas fa-plus me-2"></i>
                        Create Your First Task
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-12">
                      {filteredTasks.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-bolt me-2 text-warning"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <button 
                      onClick={() => navigate("/studyplan")} 
                      className="btn btn-outline-primary w-100 py-3"
                    >
                      <i className="fas fa-calendar-alt d-block mb-2 fs-4"></i>
                      <div className="fw-semibold">Study Plan</div>
                      <small className="text-muted">Plan your learning</small>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button 
                      onClick={() => navigate("/topics")} 
                      className="btn btn-outline-success w-100 py-3"
                    >
                      <i className="fas fa-book d-block mb-2 fs-4"></i>
                      <div className="fw-semibold">Topics</div>
                      <small className="text-muted">Browse subjects</small>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button 
                      onClick={() => navigate("/studygroups")} 
                      className="btn btn-outline-info w-100 py-3"
                    >
                      <i className="fas fa-users d-block mb-2 fs-4"></i>
                      <div className="fw-semibold">Study Groups</div>
                      <small className="text-muted">Join discussions</small>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button 
                      onClick={() => navigate("/quickanswer")} 
                      className="btn btn-outline-warning w-100 py-3"
                    >
                      <i className="fas fa-lightbulb d-block mb-2 fs-4"></i>
                      <div className="fw-semibold">Quick Help</div>
                      <small className="text-muted">Get instant answers</small>
                    </button>
                  </div>
                </div>
              </div>
            </div>
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