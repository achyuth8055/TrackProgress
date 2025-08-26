import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError, ApolloError } from 'apollo-server-express';
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
    throw new AuthenticationError('Invalid token');
  }
};

const resolvers = {
  Query: {
    health: () => 'Server is running!',
    
    me: async (_, __, { token }) => {
      return await getUserFromToken(token);
    },
    
    tasks: async (_, { limit, offset }, { token }) => {
      const user = await getUserFromToken(token);
      return user.tasks
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(offset, offset + limit);
    },
    
    task: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      return user.tasks.id(id);
    },
    
    studySessions: async (_, { limit, offset }, { token }) => {
      const user = await getUserFromToken(token);
      return user.studySessions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(offset, offset + limit);
    },
    
    studySession: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      return user.studySessions.id(id);
    },
  },

  Mutation: {
    signup: async (_, { name, email, password }) => {
      try {
        if (!name || !email || !password) {
          throw new ApolloError('All fields are required', 'VALIDATION_ERROR');
        }

        if (password.length < 6) {
          throw new ApolloError('Password must be at least 6 characters', 'VALIDATION_ERROR');
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          throw new ApolloError('User already exists with this email', 'USER_EXISTS');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
          firebaseUid: `local_${Date.now()}`,
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          avatar: '',
        });

        await user.save();

        const token = jwt.sign(
          { userId: user._id.toString() },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '7d' }
        );

        return {
          token,
          user: {
            id: user._id.toString(),
            firebaseUid: user.firebaseUid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            tasks: user.tasks,
            studySessions: user.studySessions,
            preferences: user.preferences,
            stats: user.stats,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString(),
          },
        };
      } catch (error) {
        console.error('Signup error:', error);
        throw error instanceof ApolloError ? error : new ApolloError('Signup failed');
      }
    },

    login: async (_, { email, password }) => {
      try {
        if (!email || !password) {
          throw new ApolloError('Email and password are required', 'VALIDATION_ERROR');
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.password) {
          throw new AuthenticationError('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new AuthenticationError('Invalid email or password');
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign(
          { userId: user._id.toString() },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '7d' }
        );

        return {
          token,
          user: {
            id: user._id.toString(),
            firebaseUid: user.firebaseUid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            tasks: user.tasks,
            studySessions: user.studySessions,
            preferences: user.preferences,
            stats: user.stats,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString(),
          },
        };
      } catch (error) {
        console.error('Login error:', error);
        throw error instanceof AuthenticationError ? error : new ApolloError('Login failed');
      }
    },

    loginWithGoogle: async (_, { idToken }) => {
      try {
        // Verify Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        
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
          user.lastLoginAt = new Date();
          await user.save();
        }

        const token = jwt.sign(
          { userId: user._id.toString() },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '7d' }
        );

        return {
          token,
          user: {
            id: user._id.toString(),
            firebaseUid: user.firebaseUid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            tasks: user.tasks,
            studySessions: user.studySessions,
            preferences: user.preferences,
            stats: user.stats,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString(),
          },
        };
      } catch (error) {
        console.error('Google login error:', error);
        throw new ApolloError('Google authentication failed');
      }
    },

    createTask: async (_, { input }, { token }) => {
      const user = await getUserFromToken(token);
      await user.addTask(input);
      const newTask = user.tasks[user.tasks.length - 1];
      return {
        id: newTask._id.toString(),
        title: newTask.title,
        description: newTask.description,
        completed: newTask.completed,
        priority: newTask.priority,
        dueDate: newTask.dueDate?.toISOString(),
        category: newTask.category,
        tags: newTask.tags,
        estimatedMinutes: newTask.estimatedMinutes,
        createdAt: newTask.createdAt.toISOString(),
        updatedAt: newTask.updatedAt.toISOString(),
      };
    },

    updateTask: async (_, { id, input }, { token }) => {
      const user = await getUserFromToken(token);
      await user.updateTask(id, input);
      const updatedTask = user.tasks.id(id);
      return {
        id: updatedTask._id.toString(),
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate?.toISOString(),
        category: updatedTask.category,
        tags: updatedTask.tags,
        estimatedMinutes: updatedTask.estimatedMinutes,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      };
    },

    toggleTaskComplete: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      const task = user.tasks.id(id);
      if (!task) throw new ApolloError('Task not found');
      
      await user.updateTask(id, { completed: !task.completed });
      const updatedTask = user.tasks.id(id);
      
      return {
        id: updatedTask._id.toString(),
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate?.toISOString(),
        category: updatedTask.category,
        tags: updatedTask.tags,
        estimatedMinutes: updatedTask.estimatedMinutes,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      };
    },

    deleteTask: async (_, { id }, { token }) => {
      const user = await getUserFromToken(token);
      await user.deleteTask(id);
      return true;
    },

    createStudySession: async (_, { input }, { token }) => {
      const user = await getUserFromToken(token);
      await user.addStudySession(input);
      const newSession = user.studySessions[user.studySessions.length - 1];
      return {
        id: newSession._id.toString(),
        subject: newSession.subject,
        topic: newSession.topic,
        duration: newSession.duration,
        notes: newSession.notes,
        difficulty: newSession.difficulty,
        completed: newSession.completed,
        startTime: newSession.startTime?.toISOString(),
        endTime: newSession.endTime?.toISOString(),
        createdAt: newSession.createdAt.toISOString(),
        updatedAt: newSession.updatedAt.toISOString(),
      };
    },

    updateProfile: async (_, { name, avatar }, { token }) => {
      const user = await getUserFromToken(token);
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();
      return user;
    },

    updatePreferences: async (_, { input }, { token }) => {
      const user = await getUserFromToken(token);
      Object.assign(user.preferences, input);
      await user.save();
      return user;
    },
  },
};

export default resolvers;