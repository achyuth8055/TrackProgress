import User from '../models/User.js'; // Updated path
import jwt from 'jsonwebtoken';
import { AuthenticationError, ApolloError, ForbiddenError } from 'apollo-server-express';
import dotenv from 'dotenv';

dotenv.config();

// Mock Firebase token verification for development
const mockVerifyIdToken = async (idToken) => {
  if (!idToken || idToken === 'invalid_token') {
    throw new Error('Invalid token');
  }
  
  // For development, allow any token that looks like an email
  if (idToken.includes('@')) {
    return {
      uid: `firebase_${Buffer.from(idToken).toString('base64')}`,
      name: idToken.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      email: idToken,
      picture: 'https://via.placeholder.com/100'
    };
  }

  // Generate mock data for any other token
  const mockUserData = {
    uid: `firebase_${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://via.placeholder.com/100'
  };

  return mockUserData;
};

// Helper function to require authentication
const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError('You must be logged in to perform this action');
  }
  return user;
};

// Helper function to filter tasks
const filterTasks = (tasks, filter, category, priority) => {
  let filteredTasks = [...tasks];

  // Filter by completion status and dates
  switch (filter) {
    case 'PENDING':
      filteredTasks = filteredTasks.filter(task => !task.completed);
      break;
    case 'COMPLETED':
      filteredTasks = filteredTasks.filter(task => task.completed);
      break;
    case 'OVERDUE':
      const now = new Date();
      filteredTasks = filteredTasks.filter(task => 
        !task.completed && task.dueDate && new Date(task.dueDate) < now
      );
      break;
    case 'TODAY':
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) >= startOfToday && 
        new Date(task.dueDate) <= endOfToday
      );
      break;
    case 'THIS_WEEK':
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      filteredTasks = filteredTasks.filter(task =>
        task.dueDate &&
        new Date(task.dueDate) >= startOfWeek &&
        new Date(task.dueDate) <= endOfWeek
      );
      break;
  }

  // Filter by category
  if (category) {
    filteredTasks = filteredTasks.filter(task => 
      task.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by priority
  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority.toLowerCase());
  }

  return filteredTasks;
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('-__v');
      if (!userData) {
        throw new Error('User not found');
      }

      return {
        id: userData._id.toString(),
        firebaseUid: userData.firebaseUid,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        tasks: userData.tasks.map(task => ({
          id: task._id.toString(),
          title: task.title,
          description: task.description || '',
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        })),
        studySessions: userData.studySessions.map(session => ({
          id: session._id.toString(),
          subject: session.subject,
          topic: session.topic,
          duration: session.duration,
          notes: session.notes || '',
          difficulty: session.difficulty.toUpperCase(),
          completed: session.completed,
          startTime: session.startTime ? session.startTime.toISOString() : null,
          endTime: session.endTime ? session.endTime.toISOString() : null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        })),
        preferences: {
          theme: userData.preferences.theme.toUpperCase(),
          notifications: userData.preferences.notifications,
          dailyStudyGoal: userData.preferences.dailyStudyGoal,
          timezone: userData.preferences.timezone,
        },
        stats: {
          totalStudyTime: userData.stats.totalStudyTime,
          totalTasks: userData.stats.totalTasks,
          completedTasks: userData.stats.completedTasks,
          currentStreak: userData.stats.currentStreak,
          longestStreak: userData.stats.longestStreak,
          taskCompletionRate: userData.stats.totalTasks > 0 
            ? (userData.stats.completedTasks / userData.stats.totalTasks) * 100 
            : 0,
          averageSessionDuration: userData.getStudyStats().averageSessionDuration,
        },
        createdAt: userData.createdAt.toISOString(),
        updatedAt: userData.updatedAt.toISOString(),
        lastLoginAt: userData.lastLoginAt ? userData.lastLoginAt.toISOString() : null,
      };
    },

    tasks: async (_, { filter = 'ALL', category, priority, limit = 50, offset = 0 }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('tasks');
      if (!userData) {
        throw new Error('User not found');
      }

      const filteredTasks = filterTasks(userData.tasks, filter, category, priority);
      const paginatedTasks = filteredTasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + limit);

      return paginatedTasks.map(task => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        priority: task.priority.toUpperCase(),
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        category: task.category,
        tags: task.tags,
        estimatedMinutes: task.estimatedMinutes,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }));
    },

    task: async (_, { id }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('tasks');
      if (!userData) {
        throw new Error('User not found');
      }

      const task = userData.tasks.id(id);
      if (!task) {
        throw new Error('Task not found');
      }

      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        priority: task.priority.toUpperCase(),
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        category: task.category,
        tags: task.tags,
        estimatedMinutes: task.estimatedMinutes,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    },

    taskStats: async (_, __, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('tasks');
      if (!userData) {
        throw new Error('User not found');
      }

      const tasks = userData.tasks;
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Priority breakdown
      const highPriority = tasks.filter(t => t.priority === 'high').length;
      const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
      const lowPriority = tasks.filter(t => t.priority === 'low').length;

      // Category breakdown
      const categoryMap = new Map();
      tasks.forEach(task => {
        if (!categoryMap.has(task.category)) {
          categoryMap.set(task.category, { total: 0, completed: 0 });
        }
        categoryMap.get(task.category).total++;
        if (task.completed) {
          categoryMap.get(task.category).completed++;
        }
      });

      const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.total,
        completed: stats.completed,
      }));

      return {
        total,
        completed,
        pending,
        completionRate,
        byPriority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
        byCategory,
      };
    },

    studySessions: async (_, { limit = 20, offset = 0 }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('studySessions');
      if (!userData) {
        throw new Error('User not found');
      }

      const sessions = userData.studySessions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + limit);

      return sessions.map(session => ({
        id: session._id.toString(),
        subject: session.subject,
        topic: session.topic,
        duration: session.duration,
        notes: session.notes || '',
        difficulty: session.difficulty.toUpperCase(),
        completed: session.completed,
        startTime: session.startTime ? session.startTime.toISOString() : null,
        endTime: session.endTime ? session.endTime.toISOString() : null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      }));
    },

    recentSessions: async (_, { limit = 5 }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('studySessions');
      if (!userData) {
        throw new Error('User not found');
      }

      const recentSessions = userData.studySessions
        .filter(session => session.completed)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

      return recentSessions.map(session => ({
        id: session._id.toString(),
        subject: session.subject,
        topic: session.topic,
        duration: session.duration,
        notes: session.notes || '',
        difficulty: session.difficulty.toUpperCase(),
        completed: session.completed,
        startTime: session.startTime ? session.startTime.toISOString() : null,
        endTime: session.endTime ? session.endTime.toISOString() : null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      }));
    },

    health: () => "Server is running!"
  },

  Mutation: {
    loginWithGoogle: async (_, { idToken }) => {
      if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
        throw new ApolloError('Invalid or missing ID token', 'INVALID_INPUT');
      }

      try {
        console.log(`🔐 Attempting authentication with token: ${idToken.substring(0, 20)}...`);

        const decodedToken = await mockVerifyIdToken(idToken.trim());
        const { uid, name, email, picture } = decodedToken;

        console.log(`👤 Authenticating user: ${email}`);

        let user = await User.findOne({ firebaseUid: uid });
        
        if (!user) {
          user = new User({
            firebaseUid: uid,
            name: name || email.split('@')[0],
            email,
            avatar: picture || '',
            lastLoginAt: new Date()
          });
          await user.save();
          console.log(`✨ Created new user: ${user.email} (${user._id})`);
        } else {
          user.lastLoginAt = new Date();
          if (picture && picture !== user.avatar) {
            user.avatar = picture;
          }
          if (name && name !== user.name) {
            user.name = name;
          }
          await user.save();
          console.log(`🔄 Updated existing user: ${user.email} (${user._id})`);
        }

        const tokenPayload = {
          userId: user._id.toString(),
          email: user.email,
          firebaseUid: user.firebaseUid
        };

        const token = jwt.sign(
          tokenPayload,
          process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
          { 
            expiresIn: '7d',
            issuer: 'studytracker-api',
            audience: 'studytracker-app'
          }
        );

        const authPayload = {
          token,
          user: {
            id: user._id.toString(),
            firebaseUid: user.firebaseUid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            tasks: user.tasks.map(task => ({
              id: task._id.toString(),
              title: task.title,
              description: task.description || '',
              completed: task.completed,
              priority: task.priority.toUpperCase(),
              dueDate: task.dueDate ? task.dueDate.toISOString() : null,
              category: task.category,
              tags: task.tags,
              estimatedMinutes: task.estimatedMinutes,
              createdAt: task.createdAt.toISOString(),
              updatedAt: task.updatedAt.toISOString(),
            })),
            studySessions: user.studySessions.map(session => ({
              id: session._id.toString(),
              subject: session.subject,
              topic: session.topic,
              duration: session.duration,
              notes: session.notes || '',
              difficulty: session.difficulty.toUpperCase(),
              completed: session.completed,
              startTime: session.startTime ? session.startTime.toISOString() : null,
              endTime: session.endTime ? session.endTime.toISOString() : null,
              createdAt: session.createdAt.toISOString(),
              updatedAt: session.updatedAt.toISOString(),
            })),
            preferences: {
              theme: user.preferences.theme.toUpperCase(),
              notifications: user.preferences.notifications,
              dailyStudyGoal: user.preferences.dailyStudyGoal,
              timezone: user.preferences.timezone,
            },
            stats: {
              totalStudyTime: user.stats.totalStudyTime,
              totalTasks: user.stats.totalTasks,
              completedTasks: user.stats.completedTasks,
              currentStreak: user.stats.currentStreak,
              longestStreak: user.stats.longestStreak,
              taskCompletionRate: user.stats.totalTasks > 0 
                ? (user.stats.completedTasks / user.stats.totalTasks) * 100 
                : 0,
              averageSessionDuration: user.getStudyStats().averageSessionDuration,
            },
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt.toISOString(),
          },
        };

        console.log(`✅ Authentication successful for ${user.email}`);
        return authPayload;

      } catch (error) {
        console.error('❌ Login error:', error);

        if (error.message.includes('Invalid token') || error.message.includes('auth/')) {
          throw new AuthenticationError('Invalid Google ID token provided');
        }

        if (error.name === 'ValidationError') {
          throw new ApolloError(`User validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        if (error.code === 11000) {
          throw new ApolloError('User with this email already exists', 'USER_EXISTS');
        }

        throw new ApolloError('Authentication failed. Please try again.', 'AUTH_FAILED');
      }
    },

    createTask: async (_, { input }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const taskData = {
          title: input.title.trim(),
          description: input.description?.trim() || '',
          priority: input.priority?.toLowerCase() || 'medium',
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          category: input.category || 'general',
          tags: input.tags || [],
          estimatedMinutes: input.estimatedMinutes || null,
        };

        userData.tasks.push(taskData);
        await userData.save();

        const newTask = userData.tasks[userData.tasks.length - 1];

        console.log(`✅ Created task: ${newTask.title} for user ${user.id}`);

        return {
          id: newTask._id.toString(),
          title: newTask.title,
          description: newTask.description,
          completed: newTask.completed,
          priority: newTask.priority.toUpperCase(),
          dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : null,
          category: newTask.category,
          tags: newTask.tags,
          estimatedMinutes: newTask.estimatedMinutes,
          createdAt: newTask.createdAt.toISOString(),
          updatedAt: newTask.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Create task error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Task validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to create task. Please try again.', 'CREATE_TASK_FAILED');
      }
    },

    updateTask: async (_, { id, input }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const task = userData.tasks.id(id);
        if (!task) {
          throw new Error('Task not found');
        }

        // Update only provided fields
        if (input.title !== undefined) task.title = input.title.trim();
        if (input.description !== undefined) task.description = input.description?.trim() || '';
        if (input.completed !== undefined) task.completed = input.completed;
        if (input.priority !== undefined) task.priority = input.priority.toLowerCase();
        if (input.dueDate !== undefined) task.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        if (input.category !== undefined) task.category = input.category;
        if (input.tags !== undefined) task.tags = input.tags || [];
        if (input.estimatedMinutes !== undefined) task.estimatedMinutes = input.estimatedMinutes;

        await userData.save();

        console.log(`✅ Updated task: ${task.title} for user ${user.id}`);

        return {
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Update task error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Task validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to update task. Please try again.', 'UPDATE_TASK_FAILED');
      }
    },

    deleteTask: async (_, { id }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const task = userData.tasks.id(id);
        if (!task) {
          throw new Error('Task not found');
        }

        task.deleteOne();
        await userData.save();

        console.log(`✅ Deleted task: ${id} for user ${user.id}`);
        return true;

      } catch (error) {
        console.error('❌ Delete task error:', error);
        throw new ApolloError('Failed to delete task. Please try again.', 'DELETE_TASK_FAILED');
      }
    },

    toggleTaskComplete: async (_, { id }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const task = userData.tasks.id(id);
        if (!task) {
          throw new Error('Task not found');
        }

        task.completed = !task.completed;
        await userData.save();

        console.log(`✅ Toggled task completion: ${task.title} -> ${task.completed} for user ${user.id}`);

        return {
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Toggle task error:', error);
        throw new ApolloError('Failed to toggle task completion. Please try again.', 'TOGGLE_TASK_FAILED');
      }
    },

    createMultipleTasks: async (_, { tasks }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const taskData = tasks.map(task => ({
          title: task.title.trim(),
          description: task.description?.trim() || '',
          priority: task.priority?.toLowerCase() || 'medium',
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          category: task.category || 'general',
          tags: task.tags || [],
          estimatedMinutes: task.estimatedMinutes || null,
        }));

        userData.tasks.push(...taskData);
        await userData.save();

        const newTasks = userData.tasks.slice(-tasks.length);

        console.log(`✅ Created ${tasks.length} tasks for user ${user.id}`);

        return newTasks.map(task => ({
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        }));

      } catch (error) {
        console.error('❌ Create multiple tasks error:', error);
        throw new ApolloError('Failed to create tasks. Please try again.', 'CREATE_MULTIPLE_TASKS_FAILED');
      }
    },

    deleteMultipleTasks: async (_, { ids }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        ids.forEach(id => {
          const task = userData.tasks.id(id);
          if (task) {
            task.deleteOne();
          }
        });

        await userData.save();

        console.log(`✅ Deleted ${ids.length} tasks for user ${user.id}`);
        return true;

      } catch (error) {
        console.error('❌ Delete multiple tasks error:', error);
        throw new ApolloError('Failed to delete tasks. Please try again.', 'DELETE_MULTIPLE_TASKS_FAILED');
      }
    },

    markMultipleTasksComplete: async (_, { ids }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const updatedTasks = [];
        ids.forEach(id => {
          const task = userData.tasks.id(id);
          if (task) {
            task.completed = true;
            updatedTasks.push(task);
          }
        });

        await userData.save();

        console.log(`✅ Marked ${ids.length} tasks as complete for user ${user.id}`);

        return updatedTasks.map(task => ({
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        }));

      } catch (error) {
        console.error('❌ Mark multiple tasks complete error:', error);
        throw new ApolloError('Failed to mark tasks as complete. Please try again.', 'MARK_MULTIPLE_TASKS_COMPLETE_FAILED');
      }
    },

    createStudySession: async (_, { input }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const sessionData = {
          subject: input.subject.trim(),
          topic: input.topic.trim(),
          duration: input.duration,
          notes: input.notes?.trim() || '',
          difficulty: input.difficulty.toLowerCase(),
          completed: input.completed || false,
          startTime: input.completed ? new Date(Date.now() - (input.duration * 60000)) : null,
          endTime: input.completed ? new Date() : null,
        };

        userData.studySessions.push(sessionData);
        await userData.save();

        const newSession = userData.studySessions[userData.studySessions.length - 1];

        console.log(`✅ Created study session: ${newSession.subject} - ${newSession.topic} for user ${user.id}`);

        return {
          id: newSession._id.toString(),
          subject: newSession.subject,
          topic: newSession.topic,
          duration: newSession.duration,
          notes: newSession.notes,
          difficulty: newSession.difficulty.toUpperCase(),
          completed: newSession.completed,
          startTime: newSession.startTime ? newSession.startTime.toISOString() : null,
          endTime: newSession.endTime ? newSession.endTime.toISOString() : null,
          createdAt: newSession.createdAt.toISOString(),
          updatedAt: newSession.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Create study session error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Study session validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to create study session. Please try again.', 'CREATE_SESSION_FAILED');
      }
    },

    updateStudySession: async (_, { id, input }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const session = userData.studySessions.id(id);
        if (!session) {
          throw new Error('Study session not found');
        }

        // Update only provided fields
        if (input.subject !== undefined) session.subject = input.subject.trim();
        if (input.topic !== undefined) session.topic = input.topic.trim();
        if (input.duration !== undefined) session.duration = input.duration;
        if (input.notes !== undefined) session.notes = input.notes?.trim() || '';
        if (input.difficulty !== undefined) session.difficulty = input.difficulty.toLowerCase();
        if (input.completed !== undefined) session.completed = input.completed;
        if (input.startTime !== undefined) session.startTime = input.startTime ? new Date(input.startTime) : null;
        if (input.endTime !== undefined) session.endTime = input.endTime ? new Date(input.endTime) : null;

        await userData.save();

        console.log(`✅ Updated study session: ${session.subject} - ${session.topic} for user ${user.id}`);

        return {
          id: session._id.toString(),
          subject: session.subject,
          topic: session.topic,
          duration: session.duration,
          notes: session.notes,
          difficulty: session.difficulty.toUpperCase(),
          completed: session.completed,
          startTime: session.startTime ? session.startTime.toISOString() : null,
          endTime: session.endTime ? session.endTime.toISOString() : null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Update study session error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Study session validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to update study session. Please try again.', 'UPDATE_SESSION_FAILED');
      }
    },

    deleteStudySession: async (_, { id }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const session = userData.studySessions.id(id);
        if (!session) {
          throw new Error('Study session not found');
        }

        session.deleteOne();
        await userData.save();

        console.log(`✅ Deleted study session: ${id} for user ${user.id}`);
        return true;

      } catch (error) {
        console.error('❌ Delete study session error:', error);
        throw new ApolloError('Failed to delete study session. Please try again.', 'DELETE_SESSION_FAILED');
      }
    },

    startStudySession: async (_, { subject, topic }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const sessionData = {
          subject: subject.trim(),
          topic: topic.trim(),
          duration: 0, // Will be calculated when ended
          difficulty: 'medium', // Default difficulty
          completed: false,
          startTime: new Date(),
        };

        userData.studySessions.push(sessionData);
        await userData.save();

        const newSession = userData.studySessions[userData.studySessions.length - 1];

        console.log(`✅ Started study session: ${newSession.subject} - ${newSession.topic} for user ${user.id}`);

        return {
          id: newSession._id.toString(),
          subject: newSession.subject,
          topic: newSession.topic,
          duration: newSession.duration,
          notes: newSession.notes,
          difficulty: newSession.difficulty.toUpperCase(),
          completed: newSession.completed,
          startTime: newSession.startTime.toISOString(),
          endTime: null,
          createdAt: newSession.createdAt.toISOString(),
          updatedAt: newSession.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Start study session error:', error);
        throw new ApolloError('Failed to start study session. Please try again.', 'START_SESSION_FAILED');
      }
    },

    endStudySession: async (_, { id, notes, difficulty }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const session = userData.studySessions.id(id);
        if (!session) {
          throw new Error('Study session not found');
        }

        if (session.completed) {
          throw new Error('Study session already completed');
        }

        const endTime = new Date();
        const duration = session.startTime 
          ? Math.round((endTime - session.startTime) / 60000) // Convert to minutes
          : 1; // Default to 1 minute if no start time

        session.endTime = endTime;
        session.duration = Math.max(duration, 1); // Ensure at least 1 minute
        session.completed = true;
        session.notes = notes?.trim() || '';
        session.difficulty = difficulty?.toLowerCase() || session.difficulty;

        await userData.save();

        console.log(`✅ Ended study session: ${session.subject} - ${session.topic} (${duration} min) for user ${user.id}`);

        return {
          id: session._id.toString(),
          subject: session.subject,
          topic: session.topic,
          duration: session.duration,
          notes: session.notes,
          difficulty: session.difficulty.toUpperCase(),
          completed: session.completed,
          startTime: session.startTime ? session.startTime.toISOString() : null,
          endTime: session.endTime.toISOString(),
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ End study session error:', error);
        throw new ApolloError(error.message || 'Failed to end study session. Please try again.', 'END_SESSION_FAILED');
      }
    },

    updateProfile: async (_, { name, avatar }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        if (name !== undefined) userData.name = name.trim();
        if (avatar !== undefined) userData.avatar = avatar?.trim() || '';

        await userData.save();

        console.log(`✅ Updated profile for user ${user.id}`);

        return {
          id: userData._id.toString(),
          firebaseUid: userData.firebaseUid,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          tasks: userData.tasks.map(task => ({
            id: task._id.toString(),
            title: task.title,
            description: task.description || '',
            completed: task.completed,
            priority: task.priority.toUpperCase(),
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            category: task.category,
            tags: task.tags,
            estimatedMinutes: task.estimatedMinutes,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
          })),
          studySessions: userData.studySessions.map(session => ({
            id: session._id.toString(),
            subject: session.subject,
            topic: session.topic,
            duration: session.duration,
            notes: session.notes || '',
            difficulty: session.difficulty.toUpperCase(),
            completed: session.completed,
            startTime: session.startTime ? session.startTime.toISOString() : null,
            endTime: session.endTime ? session.endTime.toISOString() : null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          })),
          preferences: {
            theme: userData.preferences.theme.toUpperCase(),
            notifications: userData.preferences.notifications,
            dailyStudyGoal: userData.preferences.dailyStudyGoal,
            timezone: userData.preferences.timezone,
          },
          stats: {
            totalStudyTime: userData.stats.totalStudyTime,
            totalTasks: userData.stats.totalTasks,
            completedTasks: userData.stats.completedTasks,
            currentStreak: userData.stats.currentStreak,
            longestStreak: userData.stats.longestStreak,
            taskCompletionRate: userData.stats.totalTasks > 0 
              ? (userData.stats.completedTasks / userData.stats.totalTasks) * 100 
              : 0,
            averageSessionDuration: userData.getStudyStats().averageSessionDuration,
          },
          createdAt: userData.createdAt.toISOString(),
          updatedAt: userData.updatedAt.toISOString(),
          lastLoginAt: userData.lastLoginAt ? userData.lastLoginAt.toISOString() : null,
        };

      } catch (error) {
        console.error('❌ Update profile error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Profile validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to update profile. Please try again.', 'UPDATE_PROFILE_FAILED');
      }
    },

    updatePreferences: async (_, { input }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        // Update only provided preferences
        if (input.theme !== undefined) userData.preferences.theme = input.theme.toLowerCase();
        if (input.notifications !== undefined) userData.preferences.notifications = input.notifications;
        if (input.dailyStudyGoal !== undefined) userData.preferences.dailyStudyGoal = input.dailyStudyGoal;
        if (input.timezone !== undefined) userData.preferences.timezone = input.timezone;

        await userData.save();

        console.log(`✅ Updated preferences for user ${user.id}`);

        return {
          id: userData._id.toString(),
          firebaseUid: userData.firebaseUid,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          tasks: userData.tasks.map(task => ({
            id: task._id.toString(),
            title: task.title,
            description: task.description || '',
            completed: task.completed,
            priority: task.priority.toUpperCase(),
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            category: task.category,
            tags: task.tags,
            estimatedMinutes: task.estimatedMinutes,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
          })),
          studySessions: userData.studySessions.map(session => ({
            id: session._id.toString(),
            subject: session.subject,
            topic: session.topic,
            duration: session.duration,
            notes: session.notes || '',
            difficulty: session.difficulty.toUpperCase(),
            completed: session.completed,
            startTime: session.startTime ? session.startTime.toISOString() : null,
            endTime: session.endTime ? session.endTime.toISOString() : null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          })),
          preferences: {
            theme: userData.preferences.theme.toUpperCase(),
            notifications: userData.preferences.notifications,
            dailyStudyGoal: userData.preferences.dailyStudyGoal,
            timezone: userData.preferences.timezone,
          },
          stats: {
            totalStudyTime: userData.stats.totalStudyTime,
            totalTasks: userData.stats.totalTasks,
            completedTasks: userData.stats.completedTasks,
            currentStreak: userData.stats.currentStreak,
            longestStreak: userData.stats.longestStreak,
            taskCompletionRate: userData.stats.totalTasks > 0 
              ? (userData.stats.completedTasks / userData.stats.totalTasks) * 100 
              : 0,
            averageSessionDuration: userData.getStudyStats().averageSessionDuration,
          },
          createdAt: userData.createdAt.toISOString(),
          updatedAt: userData.updatedAt.toISOString(),
          lastLoginAt: userData.lastLoginAt ? userData.lastLoginAt.toISOString() : null,
        };

      } catch (error) {
        console.error('❌ Update preferences error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Preferences validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to update preferences. Please try again.', 'UPDATE_PREFERENCES_FAILED');
      }
    },

    resetUserData: async (_, __, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        // Clear all user data but keep profile info
        userData.tasks = [];
        userData.studySessions = [];
        userData.stats = {
          totalStudyTime: 0,
          totalTasks: 0,
          completedTasks: 0,
          currentStreak: 0,
          longestStreak: 0
        };

        await userData.save();

        console.log(`✅ Reset user data for user ${user.id}`);
        return true;

      } catch (error) {
        console.error('❌ Reset user data error:', error);
        throw new ApolloError('Failed to reset user data. Please try again.', 'RESET_DATA_FAILED');
      }
    },

    exportUserData: async (_, __, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id).select('-__v');
        if (!userData) {
          throw new Error('User not found');
        }

        const exportData = {
          user: {
            name: userData.name,
            email: userData.email,
            createdAt: userData.createdAt.toISOString(),
            lastLoginAt: userData.lastLoginAt ? userData.lastLoginAt.toISOString() : null,
          },
          tasks: userData.tasks.map(task => ({
            title: task.title,
            description: task.description,
            completed: task.completed,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            category: task.category,
            tags: task.tags,
            estimatedMinutes: task.estimatedMinutes,
            createdAt: task.createdAt.toISOString(),
          })),
          studySessions: userData.studySessions.map(session => ({
            subject: session.subject,
            topic: session.topic,
            duration: session.duration,
            notes: session.notes,
            difficulty: session.difficulty,
            completed: session.completed,
            startTime: session.startTime ? session.startTime.toISOString() : null,
            endTime: session.endTime ? session.endTime.toISOString() : null,
            createdAt: session.createdAt.toISOString(),
          })),
          stats: userData.stats,
          preferences: userData.preferences,
          exportDate: new Date().toISOString(),
        };

        console.log(`✅ Exported user data for user ${user.id}`);
        return JSON.stringify(exportData, null, 2);

      } catch (error) {
        console.error('❌ Export user data error:', error);
        throw new ApolloError('Failed to export user data. Please try again.', 'EXPORT_DATA_FAILED');
      }
    },
  },
};

// backend/resolver/resolver.js
import User from '../model/User.js'; // Fixed import path
import jwt from 'jsonwebtoken';
import { AuthenticationError, ApolloError, ForbiddenError } from 'apollo-server-express';
import dotenv from 'dotenv';

dotenv.config();

// Mock Firebase token verification for development
const mockVerifyIdToken = async (idToken) => {
  if (!idToken || idToken === 'invalid_token') {
    throw new Error('Invalid token');
  }
  
  // For development, allow any token that looks like an email
  if (idToken.includes('@')) {
    return {
      uid: `firebase_${Buffer.from(idToken).toString('base64')}`,
      name: idToken.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      email: idToken,
      picture: 'https://via.placeholder.com/100'
    };
  }

  // Generate mock data for any other token
  const mockUserData = {
    uid: `firebase_${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://via.placeholder.com/100'
  };

  return mockUserData;
};

// Helper function to require authentication
const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError('You must be logged in to perform this action');
  }
  return user;
};

// Helper function to filter tasks
const filterTasks = (tasks, filter, category, priority) => {
  let filteredTasks = [...tasks];

  // Filter by completion status and dates
  switch (filter) {
    case 'PENDING':
      filteredTasks = filteredTasks.filter(task => !task.completed);
      break;
    case 'COMPLETED':
      filteredTasks = filteredTasks.filter(task => task.completed);
      break;
    case 'OVERDUE':
      const now = new Date();
      filteredTasks = filteredTasks.filter(task => 
        !task.completed && task.dueDate && new Date(task.dueDate) < now
      );
      break;
    case 'TODAY':
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) >= startOfToday && 
        new Date(task.dueDate) <= endOfToday
      );
      break;
    case 'THIS_WEEK':
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      filteredTasks = filteredTasks.filter(task =>
        task.dueDate &&
        new Date(task.dueDate) >= startOfWeek &&
        new Date(task.dueDate) <= endOfWeek
      );
      break;
  }

  // Filter by category
  if (category) {
    filteredTasks = filteredTasks.filter(task => 
      task.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by priority
  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority.toLowerCase());
  }

  return filteredTasks;
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('-__v');
      if (!userData) {
        throw new Error('User not found');
      }

      return {
        id: userData._id.toString(),
        firebaseUid: userData.firebaseUid,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        tasks: userData.tasks.map(task => ({
          id: task._id.toString(),
          title: task.title,
          description: task.description || '',
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        })),
        studySessions: userData.studySessions.map(session => ({
          id: session._id.toString(),
          subject: session.subject,
          topic: session.topic,
          duration: session.duration,
          notes: session.notes || '',
          difficulty: session.difficulty.toUpperCase(),
          completed: session.completed,
          startTime: session.startTime ? session.startTime.toISOString() : null,
          endTime: session.endTime ? session.endTime.toISOString() : null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        })),
        preferences: {
          theme: userData.preferences.theme.toUpperCase(),
          notifications: userData.preferences.notifications,
          dailyStudyGoal: userData.preferences.dailyStudyGoal,
          timezone: userData.preferences.timezone,
        },
        stats: {
          totalStudyTime: userData.stats.totalStudyTime,
          totalTasks: userData.stats.totalTasks,
          completedTasks: userData.stats.completedTasks,
          currentStreak: userData.stats.currentStreak,
          longestStreak: userData.stats.longestStreak,
          taskCompletionRate: userData.stats.totalTasks > 0 
            ? (userData.stats.completedTasks / userData.stats.totalTasks) * 100 
            : 0,
          averageSessionDuration: userData.getStudyStats().averageSessionDuration,
        },
        createdAt: userData.createdAt.toISOString(),
        updatedAt: userData.updatedAt.toISOString(),
        lastLoginAt: userData.lastLoginAt ? userData.lastLoginAt.toISOString() : null,
      };
    },

    tasks: async (_, { filter = 'ALL', category, priority, limit = 50, offset = 0 }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('tasks');
      if (!userData) {
        throw new Error('User not found');
      }

      const filteredTasks = filterTasks(userData.tasks, filter, category, priority);
      const paginatedTasks = filteredTasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + limit);

      return paginatedTasks.map(task => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        priority: task.priority.toUpperCase(),
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        category: task.category,
        tags: task.tags,
        estimatedMinutes: task.estimatedMinutes,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }));
    },

    task: async (_, { id }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('tasks');
      if (!userData) {
        throw new Error('User not found');
      }

      const task = userData.tasks.id(id);
      if (!task) {
        throw new Error('Task not found');
      }

      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        priority: task.priority.toUpperCase(),
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        category: task.category,
        tags: task.tags,
        estimatedMinutes: task.estimatedMinutes,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    },

    taskStats: async (_, __, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('tasks');
      if (!userData) {
        throw new Error('User not found');
      }

      const tasks = userData.tasks;
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Priority breakdown
      const highPriority = tasks.filter(t => t.priority === 'high').length;
      const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
      const lowPriority = tasks.filter(t => t.priority === 'low').length;

      // Category breakdown
      const categoryMap = new Map();
      tasks.forEach(task => {
        if (!categoryMap.has(task.category)) {
          categoryMap.set(task.category, { total: 0, completed: 0 });
        }
        categoryMap.get(task.category).total++;
        if (task.completed) {
          categoryMap.get(task.category).completed++;
        }
      });

      const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.total,
        completed: stats.completed,
      }));

      return {
        total,
        completed,
        pending,
        completionRate,
        byPriority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
        byCategory,
      };
    },

    studySessions: async (_, { limit = 20, offset = 0 }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('studySessions');
      if (!userData) {
        throw new Error('User not found');
      }

      const sessions = userData.studySessions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + limit);

      return sessions.map(session => ({
        id: session._id.toString(),
        subject: session.subject,
        topic: session.topic,
        duration: session.duration,
        notes: session.notes || '',
        difficulty: session.difficulty.toUpperCase(),
        completed: session.completed,
        startTime: session.startTime ? session.startTime.toISOString() : null,
        endTime: session.endTime ? session.endTime.toISOString() : null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      }));
    },

    recentSessions: async (_, { limit = 5 }, { user }) => {
      requireAuth(user);
      
      const userData = await User.findById(user.id).select('studySessions');
      if (!userData) {
        throw new Error('User not found');
      }

      const recentSessions = userData.studySessions
        .filter(session => session.completed)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

      return recentSessions.map(session => ({
        id: session._id.toString(),
        subject: session.subject,
        topic: session.topic,
        duration: session.duration,
        notes: session.notes || '',
        difficulty: session.difficulty.toUpperCase(),
        completed: session.completed,
        startTime: session.startTime ? session.startTime.toISOString() : null,
        endTime: session.endTime ? session.endTime.toISOString() : null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      }));
    },

    health: () => "Server is running!"
  },

  Mutation: {
    loginWithGoogle: async (_, { idToken }) => {
      if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
        throw new ApolloError('Invalid or missing ID token', 'INVALID_INPUT');
      }

      try {
        console.log(`🔐 Attempting authentication with token: ${idToken.substring(0, 20)}...`);

        const decodedToken = await mockVerifyIdToken(idToken.trim());
        const { uid, name, email, picture } = decodedToken;

        console.log(`👤 Authenticating user: ${email}`);

        let user = await User.findOne({ firebaseUid: uid });
        
        if (!user) {
          user = new User({
            firebaseUid: uid,
            name: name || email.split('@')[0],
            email,
            avatar: picture || '',
            lastLoginAt: new Date()
          });
          await user.save();
          console.log(`✨ Created new user: ${user.email} (${user._id})`);
        } else {
          user.lastLoginAt = new Date();
          if (picture && picture !== user.avatar) {
            user.avatar = picture;
          }
          if (name && name !== user.name) {
            user.name = name;
          }
          await user.save();
          console.log(`🔄 Updated existing user: ${user.email} (${user._id})`);
        }

        const tokenPayload = {
          userId: user._id.toString(),
          email: user.email,
          firebaseUid: user.firebaseUid
        };

        const token = jwt.sign(
          tokenPayload,
          process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
          { 
            expiresIn: '7d',
            issuer: 'studytracker-api',
            audience: 'studytracker-app'
          }
        );

        const authPayload = {
          token,
          user: {
            id: user._id.toString(),
            firebaseUid: user.firebaseUid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            tasks: user.tasks.map(task => ({
              id: task._id.toString(),
              title: task.title,
              description: task.description || '',
              completed: task.completed,
              priority: task.priority.toUpperCase(),
              dueDate: task.dueDate ? task.dueDate.toISOString() : null,
              category: task.category,
              tags: task.tags,
              estimatedMinutes: task.estimatedMinutes,
              createdAt: task.createdAt.toISOString(),
              updatedAt: task.updatedAt.toISOString(),
            })),
            studySessions: user.studySessions.map(session => ({
              id: session._id.toString(),
              subject: session.subject,
              topic: session.topic,
              duration: session.duration,
              notes: session.notes || '',
              difficulty: session.difficulty.toUpperCase(),
              completed: session.completed,
              startTime: session.startTime ? session.startTime.toISOString() : null,
              endTime: session.endTime ? session.endTime.toISOString() : null,
              createdAt: session.createdAt.toISOString(),
              updatedAt: session.updatedAt.toISOString(),
            })),
            preferences: {
              theme: user.preferences.theme.toUpperCase(),
              notifications: user.preferences.notifications,
              dailyStudyGoal: user.preferences.dailyStudyGoal,
              timezone: user.preferences.timezone,
            },
            stats: {
              totalStudyTime: user.stats.totalStudyTime,
              totalTasks: user.stats.totalTasks,
              completedTasks: user.stats.completedTasks,
              currentStreak: user.stats.currentStreak,
              longestStreak: user.stats.longestStreak,
              taskCompletionRate: user.stats.totalTasks > 0 
                ? (user.stats.completedTasks / user.stats.totalTasks) * 100 
                : 0,
              averageSessionDuration: user.getStudyStats().averageSessionDuration,
            },
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt.toISOString(),
          },
        };

        console.log(`✅ Authentication successful for ${user.email}`);
        return authPayload;

      } catch (error) {
        console.error('❌ Login error:', error);

        if (error.message.includes('Invalid token') || error.message.includes('auth/')) {
          throw new AuthenticationError('Invalid Google ID token provided');
        }

        if (error.name === 'ValidationError') {
          throw new ApolloError(`User validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        if (error.code === 11000) {
          throw new ApolloError('User with this email already exists', 'USER_EXISTS');
        }

        throw new ApolloError('Authentication failed. Please try again.', 'AUTH_FAILED');
      }
    },

    createTask: async (_, { input }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const taskData = {
          title: input.title.trim(),
          description: input.description?.trim() || '',
          priority: input.priority?.toLowerCase() || 'medium',
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          category: input.category || 'general',
          tags: input.tags || [],
          estimatedMinutes: input.estimatedMinutes || null,
        };

        userData.tasks.push(taskData);
        await userData.save();

        const newTask = userData.tasks[userData.tasks.length - 1];

        console.log(`✅ Created task: ${newTask.title} for user ${user.id}`);

        return {
          id: newTask._id.toString(),
          title: newTask.title,
          description: newTask.description,
          completed: newTask.completed,
          priority: newTask.priority.toUpperCase(),
          dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : null,
          category: newTask.category,
          tags: newTask.tags,
          estimatedMinutes: newTask.estimatedMinutes,
          createdAt: newTask.createdAt.toISOString(),
          updatedAt: newTask.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Create task error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Task validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to create task. Please try again.', 'CREATE_TASK_FAILED');
      }
    },

    updateTask: async (_, { id, input }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const task = userData.tasks.id(id);
        if (!task) {
          throw new Error('Task not found');
        }

        // Update only provided fields
        if (input.title !== undefined) task.title = input.title.trim();
        if (input.description !== undefined) task.description = input.description?.trim() || '';
        if (input.completed !== undefined) task.completed = input.completed;
        if (input.priority !== undefined) task.priority = input.priority.toLowerCase();
        if (input.dueDate !== undefined) task.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        if (input.category !== undefined) task.category = input.category;
        if (input.tags !== undefined) task.tags = input.tags || [];
        if (input.estimatedMinutes !== undefined) task.estimatedMinutes = input.estimatedMinutes;

        await userData.save();

        console.log(`✅ Updated task: ${task.title} for user ${user.id}`);

        return {
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Update task error:', error);
        
        if (error.name === 'ValidationError') {
          throw new ApolloError(`Task validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        throw new ApolloError('Failed to update task. Please try again.', 'UPDATE_TASK_FAILED');
      }
    },

    deleteTask: async (_, { id }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const task = userData.tasks.id(id);
        if (!task) {
          throw new Error('Task not found');
        }

        task.deleteOne();
        await userData.save();

        console.log(`✅ Deleted task: ${id} for user ${user.id}`);
        return true;

      } catch (error) {
        console.error('❌ Delete task error:', error);
        throw new ApolloError('Failed to delete task. Please try again.', 'DELETE_TASK_FAILED');
      }
    },

    toggleTaskComplete: async (_, { id }, { user }) => {
      requireAuth(user);

      try {
        const userData = await User.findById(user.id);
        if (!userData) {
          throw new Error('User not found');
        }

        const task = userData.tasks.id(id);
        if (!task) {
          throw new Error('Task not found');
        }

        task.completed = !task.completed;
        await userData.save();

        console.log(`✅ Toggled task completion: ${task.title} -> ${task.completed} for user ${user.id}`);

        return {
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority.toUpperCase(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          category: task.category,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        };

      } catch (error) {
        console.error('❌ Toggle task error:', error);
        throw new ApolloError('Failed to toggle task completion. Please try again.', 'TOGGLE_TASK_FAILED');
      }
    },

    // ... (rest of mutations would continue here)
    
  },
};

export default resolvers;