import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError, ApolloError, UserInputError } from 'apollo-server-express';
import { auth } from '../config/firebase.js';

// Helper function to get user from token
const getUserFromToken = async (token) => {
  if (!token) throw new AuthenticationError('Authentication required');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.userId);
    if (!user) throw new AuthenticationError('User not found');
    return user;
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Invalid or expired token');
    }
    throw error;
  }
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '7d' }
  );
};

// Helper function to format user response
const formatUser = (user) => ({
  id: user._id.toString(),
  firebaseUid: user.firebaseUid,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  tasks: user.tasks.map(formatTask),
  studySessions: user.studySessions.map(formatStudySession),
  preferences: user.preferences,
  stats: calculateUserStats(user),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  lastLoginAt: user.lastLoginAt?.toISOString() || null,
});

// Helper function to format task response
const formatTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  completed: task.completed,
  priority: task.priority.toUpperCase(),
  dueDate: task.dueDate?.toISOString() || null,
  category: task.category,
  tags: task.tags,
  estimatedMinutes: task.estimatedMinutes,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

// Helper function to format study session response
const formatStudySession = (session) => ({
  id: session._id.toString(),
  subject: session.subject,
  topic: session.topic,
  duration: session.duration,
  notes: session.notes,
  difficulty: session.difficulty.toUpperCase(),
  completed: session.completed,
  startTime: session.startTime?.toISOString() || null,
  endTime: session.endTime?.toISOString() || null,
  createdAt: session.createdAt.toISOString(),
  updatedAt: session.updatedAt.toISOString(),
});

// Helper function to calculate user statistics
const calculateUserStats = (user) => {
  const completedSessions = user.studySessions.filter(s => s.completed);
  const totalStudyTime = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration = completedSessions.length > 0 
    ? Math.round(totalStudyTime / completedSessions.length) 
    : 0;

  return {
    totalStudyTime,
    totalTasks: user.tasks.length,
    completedTasks: user.tasks.filter(t => t.completed).length,
    currentStreak: user.stats.currentStreak || 0,
    longestStreak: user.stats.longestStreak || 0,
    taskCompletionRate: user.tasks.length > 0 
      ? parseFloat(((user.tasks.filter(t => t.completed).length / user.tasks.length) * 100).toFixed(2))
      : 0,
    averageSessionDuration: parseFloat(averageSessionDuration.toFixed(2))
  };
};

// Helper function to get task statistics
const getTaskStats = (user) => {
  const tasks = user.tasks;
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  // Group by priority
  const byPriority = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Group by category
  const categoryMap = {};
  tasks.forEach(task => {
    if (!categoryMap[task.category]) {
      categoryMap[task.category] = { total: 0, completed: 0 };
    }
    categoryMap[task.category].total++;
    if (task.completed) {
      categoryMap[task.category].completed++;
    }
  });

  const byCategory = Object.entries(categoryMap).map(([category, stats]) => ({
    category,
    count: stats.total,
    completed: stats.completed,
  }));

  return {
    total: tasks.length,
    completed,
    pending,
    completionRate,
    byPriority,
    byCategory,
  };
};

// Helper function to filter tasks
const filterTasks = (tasks, filter, category, priority) => {
  let filteredTasks = [...tasks];

  // Apply category filter
  if (category) {
    filteredTasks = filteredTasks.filter(task => 
      task.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Apply priority filter
  if (priority) {
    filteredTasks = filteredTasks.filter(task => 
      task.priority.toLowerCase() === priority.toLowerCase()
    );
  }

  // Apply status filter
  switch (filter) {
    case 'COMPLETED':
      filteredTasks = filteredTasks.filter(task => task.completed);
      break;
    case 'PENDING':
      filteredTasks = filteredTasks.filter(task => !task.completed);
      break;
    case 'OVERDUE':
      filteredTasks = filteredTasks.filter(task => 
        !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
      );
      break;
    case 'TODAY':
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return today.toDateString() === dueDate.toDateString();
      });
      break;
    case 'THIS_WEEK':
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= weekFromNow;
      });
      break;
    case 'ALL':
    default:
      // No additional filtering
      break;
  }

  return filteredTasks;
};

const resolvers = {
  Query: {
    health: () => 'Server is running!',
    
    me: async (_, __, { token }) => {
      const user = await getUserFromToken(token);
      return formatUser(user);
    },
    
    tasks: async (_, { filter = 'ALL', category, priority, limit = 50, offset = 0 }, { token }) => {
      const user = await getUserFromToken(token);
      const filteredTasks = filterTasks(user.tasks, filter, category, priority);
      
      // Sort by creation date (newest first) and apply pagination
      const sortedTasks = filteredTasks
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(offset, offset + limit);
      
      return sortedTasks.map(formatTask);
    },
    
    task: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      const task = user.tasks.id(id);
      if (!task) {
        throw new UserInputError('Task not found');
      }
      return formatTask(task);
    },

    taskStats: async (_, __, { token }) => {
      const user = await getUserFromToken(token);
      return getTaskStats(user);
    },
    
    studySessions: async (_, { limit = 20, offset = 0 }, { token }) => {
      const user = await getUserFromToken(token);
      const sessions = user.studySessions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(offset, offset + limit);
      
      return sessions.map(formatStudySession);
    },
    
    studySession: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      const session = user.studySessions.id(id);
      if (!session) {
        throw new UserInputError('Study session not found');
      }
      return formatStudySession(session);
    },

    recentSessions: async (_, { limit = 5 }, { token }) => {
      const user = await getUserFromToken(token);
      const recentSessions = user.studySessions
        .filter(session => session.completed)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit);
      
      return recentSessions.map(formatStudySession);
    },
  },

  Mutation: {
    signup: async (_, { name, email, password }) => {
      try {
        // Validation
        if (!name || !email || !password) {
          throw new UserInputError('Name, email, and password are required');
        }

        if (password.length < 6) {
          throw new UserInputError('Password must be at least 6 characters long');
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
          throw new UserInputError('Please provide a valid email address');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          throw new UserInputError('A user with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user
        const user = new User({
          firebaseUid: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          avatar: '',
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        return {
          token,
          user: formatUser(user),
        };
      } catch (error) {
        console.error('Signup error:', error);
        if (error instanceof UserInputError) {
          throw error;
        }
        throw new ApolloError('Failed to create account. Please try again.');
      }
    },

    login: async (_, { email, password }) => {
      try {
        // Validation
        if (!email || !password) {
          throw new UserInputError('Email and password are required');
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.password) {
          throw new AuthenticationError('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new AuthenticationError('Invalid email or password');
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        return {
          token,
          user: formatUser(user),
        };
      } catch (error) {
        console.error('Login error:', error);
        if (error instanceof AuthenticationError || error instanceof UserInputError) {
          throw error;
        }
        throw new ApolloError('Login failed. Please try again.');
      }
    },

    loginWithGoogle: async (_, { idToken }) => {
      try {
        // Verify Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        
        // Find or create user
        let user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
          user = new User({
            firebaseUid: decodedToken.uid,
            name: decodedToken.name || decodedToken.email.split('@')[0],
            email: decodedToken.email,
            avatar: decodedToken.picture || '',
          });
          await user.save();
        } else {
          // Update last login
          user.lastLoginAt = new Date();
          await user.save();
        }

        // Generate token
        const token = generateToken(user._id);

        return {
          token,
          user: formatUser(user),
        };
      } catch (error) {
        console.error('Google login error:', error);
        throw new ApolloError('Google authentication failed. Please try again.');
      }
    },

    // Task Mutations
    createTask: async (_, { input }, { token }) => {
      const user = await getUserFromToken(token);
      
      // Validate input
      if (!input.title?.trim()) {
        throw new UserInputError('Task title is required');
      }

      const taskData = {
        ...input,
        title: input.title.trim(),
        priority: input.priority?.toLowerCase() || 'medium',
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      };

      await user.addTask(taskData);
      const newTask = user.tasks[user.tasks.length - 1];
      return formatTask(newTask);
    },

    updateTask: async (_, { id, input }, { token }) => {
      const user = await getUserFromToken(token);
      
      const updateData = { ...input };
      if (input.priority) {
        updateData.priority = input.priority.toLowerCase();
      }
      if (input.dueDate) {
        updateData.dueDate = new Date(input.dueDate);
      }
      if (input.title) {
        updateData.title = input.title.trim();
      }

      await user.updateTask(id, updateData);
      const updatedTask = user.tasks.id(id);
      return formatTask(updatedTask);
    },

    deleteTask: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      await user.deleteTask(id);
      return true;
    },

    toggleTaskComplete: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      const task = user.tasks.id(id);
      if (!task) {
        throw new UserInputError('Task not found');
      }
      
      await user.updateTask(id, { completed: !task.completed });
      const updatedTask = user.tasks.id(id);
      return formatTask(updatedTask);
    },

    // Bulk Task Operations
    createMultipleTasks: async (_, { tasks }, { token }) => {
      const user = await getUserFromToken(token);
      const createdTasks = [];

      for (const taskInput of tasks) {
        if (!taskInput.title?.trim()) {
          throw new UserInputError('All tasks must have a title');
        }

        const taskData = {
          ...taskInput,
          title: taskInput.title.trim(),
          priority: taskInput.priority?.toLowerCase() || 'medium',
          dueDate: taskInput.dueDate ? new Date(taskInput.dueDate) : null,
        };

        await user.addTask(taskData);
        const newTask = user.tasks[user.tasks.length - 1];
        createdTasks.push(formatTask(newTask));
      }

      return createdTasks;
    },

    deleteMultipleTasks: async (_, { ids }, { token }) => {
      const user = await getUserFromToken(token);
      
      for (const id of ids) {
        try {
          await user.deleteTask(id);
        } catch (error) {
          console.warn(`Failed to delete task ${id}:`, error.message);
        }
      }
      
      return true;
    },

    markMultipleTasksComplete: async (_, { ids }, { token }) => {
      const user = await getUserFromToken(token);
      const updatedTasks = [];

      for (const id of ids) {
        try {
          await user.updateTask(id, { completed: true });
          const updatedTask = user.tasks.id(id);
          updatedTasks.push(formatTask(updatedTask));
        } catch (error) {
          console.warn(`Failed to update task ${id}:`, error.message);
        }
      }

      return updatedTasks;
    },

    // Study Session Mutations
    createStudySession: async (_, { input }, { token }) => {
      const user = await getUserFromToken(token);
      
      // Validate input
      if (!input.subject?.trim()) {
        throw new UserInputError('Subject is required');
      }
      if (!input.topic?.trim()) {
        throw new UserInputError('Topic is required');
      }
      if (!input.duration || input.duration <= 0) {
        throw new UserInputError('Duration must be a positive number');
      }

      const sessionData = {
        ...input,
        subject: input.subject.trim(),
        topic: input.topic.trim(),
        difficulty: input.difficulty?.toLowerCase() || 'easy',
      };

      await user.addStudySession(sessionData);
      const newSession = user.studySessions[user.studySessions.length - 1];
      return formatStudySession(newSession);
    },

    updateStudySession: async (_, { id, input }, { token }) => {
      const user = await getUserFromToken(token);
      const session = user.studySessions.id(id);
      
      if (!session) {
        throw new UserInputError('Study session not found');
      }

      const updateData = { ...input };
      if (input.difficulty) {
        updateData.difficulty = input.difficulty.toLowerCase();
      }
      if (input.startTime) {
        updateData.startTime = new Date(input.startTime);
      }
      if (input.endTime) {
        updateData.endTime = new Date(input.endTime);
      }

      Object.assign(session, updateData);
      await user.save();

      return formatStudySession(session);
    },

    deleteStudySession: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      const session = user.studySessions.id(id);
      
      if (!session) {
        throw new UserInputError('Study session not found');
      }

      session.deleteOne();
      await user.save();
      
      return true;
    },

    startStudySession: async (_, { subject, topic }, { token }) => {
      const user = await getUserFromToken(token);
      
      const sessionData = {
        subject: subject.trim(),
        topic: topic.trim(),
        duration: 0,
        difficulty: 'medium',
        completed: false,
        startTime: new Date(),
      };

      await user.addStudySession(sessionData);
      const newSession = user.studySessions[user.studySessions.length - 1];
      return formatStudySession(newSession);
    },

    endStudySession: async (_, { id, notes, difficulty }, { token }) => {
      const user = await getUserFromToken(token);
      const session = user.studySessions.id(id);
      
      if (!session) {
        throw new UserInputError('Study session not found');
      }

      const endTime = new Date();
      const duration = session.startTime 
        ? Math.round((endTime - session.startTime) / (1000 * 60)) // minutes
        : session.duration;

      Object.assign(session, {
        endTime,
        duration,
        completed: true,
        notes: notes || session.notes,
        difficulty: difficulty?.toLowerCase() || session.difficulty,
      });

      // Update total study time
      user.stats.totalStudyTime = (user.stats.totalStudyTime || 0) + duration;
      await user.save();

      return formatStudySession(session);
    },

    // User Mutations
    updateProfile: async (_, { name, avatar }, { token }) => {
      const user = await getUserFromToken(token);
      
      if (name) {
        if (name.trim().length < 2) {
          throw new UserInputError('Name must be at least 2 characters long');
        }
        user.name = name.trim();
      }
      
      if (avatar !== undefined) {
        // Validate avatar URL if provided
        if (avatar && !/^https?:\/\/.+/.test(avatar)) {
          throw new UserInputError('Avatar must be a valid URL');
        }
        user.avatar = avatar;
      }
      
      await user.save();
      return formatUser(user);
    },

    updatePreferences: async (_, { input }, { token }) => {
      const user = await getUserFromToken(token);
      
      // Validate preferences
      if (input.dailyStudyGoal !== undefined) {
        if (input.dailyStudyGoal < 15 || input.dailyStudyGoal > 1440) {
          throw new UserInputError('Daily study goal must be between 15 and 1440 minutes');
        }
      }

      if (input.theme && !['light', 'dark'].includes(input.theme.toLowerCase())) {
        throw new UserInputError('Theme must be either "light" or "dark"');
      }

      // Update preferences
      Object.assign(user.preferences, {
        ...input,
        theme: input.theme?.toLowerCase(),
      });
      
      await user.save();
      return formatUser(user);
    },

    // Utility Mutations
    resetUserData: async (_, __, { token }) => {
      const user = await getUserFromToken(token);
      
      // Clear all tasks and study sessions
      user.tasks = [];
      user.studySessions = [];
      user.stats = {
        totalStudyTime: 0,
        totalTasks: 0,
        completedTasks: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
      
      await user.save();
      return true;
    },

    exportUserData: async (_, __, { token }) => {
      const user = await getUserFromToken(token);
      
      const exportData = {
        user: {
          name: user.name,
          email: user.email,
          preferences: user.preferences,
          stats: user.stats,
        },
        tasks: user.tasks.map(task => ({
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority,
          dueDate: task.dueDate,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt,
        })),
        studySessions: user.studySessions.map(session => ({
          subject: session.subject,
          topic: session.topic,
          duration: session.duration,
          notes: session.notes,
          difficulty: session.difficulty,
          completed: session.completed,
          createdAt: session.createdAt,
        })),
        exportedAt: new Date().toISOString(),
      };
      
      return JSON.stringify(exportData, null, 2);
    },
  },
};

export default resolvers;