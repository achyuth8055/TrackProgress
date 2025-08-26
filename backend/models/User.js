// backend/model/User.js
import mongoose from 'mongoose';

// Task subdocument schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  estimatedMinutes: {
    type: Number,
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [1440, 'Estimated time cannot exceed 24 hours']
  }
}, {
  timestamps: true
});

// Study session subdocument schema
const studySessionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [1440, 'Duration cannot exceed 24 hours']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: [true, 'Difficulty is required']
  },
  completed: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Main user schema
const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: [true, 'Firebase UID is required'],
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    index: true,
  },
  avatar: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Avatar must be a valid URL'
    }
  },
  // Task management
  tasks: [taskSchema],
  
  // Study sessions
  studySessions: [studySessionSchema],
  
  // User preferences and settings
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    dailyStudyGoal: {
      type: Number, // in minutes
      default: 60,
      min: [15, 'Daily study goal must be at least 15 minutes'],
      max: [1440, 'Daily study goal cannot exceed 24 hours']
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Activity tracking
  lastLoginAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics (calculated fields)
  stats: {
    totalStudyTime: {
      type: Number,
      default: 0 // in minutes
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0 // days
    },
    longestStreak: {
      type: Number,
      default: 0 // days
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ email: 1, firebaseUid: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'tasks.completed': 1 });
userSchema.index({ 'tasks.dueDate': 1 });
userSchema.index({ 'studySessions.createdAt': -1 });

// Instance methods
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

userSchema.methods.addTask = function(taskData) {
  this.tasks.push(taskData);
  this.stats.totalTasks = this.tasks.length;
  return this.save();
};

userSchema.methods.updateTask = function(taskId, updateData) {
  const task = this.tasks.id(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  
  Object.assign(task, updateData);
  
  // Update completion stats
  this.stats.completedTasks = this.tasks.filter(t => t.completed).length;
  
  return this.save();
};

userSchema.methods.deleteTask = function(taskId) {
  const task = this.tasks.id(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  
  task.deleteOne();
  this.stats.totalTasks = this.tasks.length;
  this.stats.completedTasks = this.tasks.filter(t => t.completed).length;
  
  return this.save();
};

userSchema.methods.addStudySession = function(sessionData) {
  this.studySessions.push(sessionData);
  
  // Update total study time if session is completed
  if (sessionData.completed && sessionData.duration) {
    this.stats.totalStudyTime += sessionData.duration;
  }
  
  return this.save();
};

userSchema.methods.getTaskStats = function() {
  const totalTasks = this.tasks.length;
  const completedTasks = this.tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    completionRate: Math.round(completionRate)
  };
};

userSchema.methods.getStudyStats = function() {
  const sessions = this.studySessions;
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.completed);
  const totalStudyTime = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration = completedSessions.length > 0 
    ? totalStudyTime / completedSessions.length 
    : 0;
  
  return {
    totalSessions,
    completedSessions: completedSessions.length,
    totalStudyTime,
    averageSessionDuration: Math.round(averageSessionDuration),
    currentStreak: this.stats.currentStreak,
    longestStreak: this.stats.longestStreak
  };
};

// Static methods
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Update stats when tasks change
  if (this.isModified('tasks')) {
    this.stats.totalTasks = this.tasks.length;
    this.stats.completedTasks = this.tasks.filter(t => t.completed).length;
  }
  
  next();
});

// Pre-validate middleware for tasks
taskSchema.pre('validate', function(next) {
  // Set due date to end of day if only date is provided
  if (this.dueDate && this.dueDate.getHours() === 0 && this.dueDate.getMinutes() === 0) {
    this.dueDate.setHours(23, 59, 59, 999);
  }
  next();
});

// Create and export the model
const User = mongoose.model('User', userSchema);

export default User;