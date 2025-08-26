const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const resolvers = {
  Query: {
    getUser: async (_, { id }) => {
      try {
        const user = await User.findById(id);
        return user;
      } catch (error) {
        throw new Error('User not found');
      }
    },
    getUsers: async () => {
      try {
        return await User.find({});
      } catch (error) {
        throw new Error('Failed to fetch users');
      }
    }
  },

  Mutation: {
    registerUser: async (_, { username, email, password }) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
          throw new UserInputError('User already exists with this email or username');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create new user
        const user = new User({
          username,
          email,
          password: hashedPassword
        });

        const savedUser = await user.save();
        
        // Generate token
        const token = jwt.sign(
          { userId: savedUser._id, email: savedUser.email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        return {
          token,
          user: savedUser
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    loginUser: async (_, { email, password }) => {
      try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError('Invalid credentials');
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new AuthenticationError('Invalid credentials');
        }

        // Generate token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }
};

module.exports = resolvers;