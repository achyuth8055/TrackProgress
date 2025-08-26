import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Use 'bcryptjs' if you installed it instead
import { AuthenticationError, ApolloError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const authResolver = {
  Mutation: {
    signup: async (_, { name, email, password }) => {
      if (!name || !email || !password) {
        throw new ApolloError('All fields are required', 'INVALID_INPUT');
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new ApolloError('Invalid email format', 'INVALID_INPUT');
      }
      if (password.length < 6) {
        throw new ApolloError('Password must be at least 6 characters', 'INVALID_INPUT');
      }

      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new ApolloError('Email already in use', 'EMAIL_EXISTS');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          firebaseUid: uuidv4(),
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          avatar: '',
        });
        await user.save();
        console.log(`Created new user: ${user.email}`);

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
            createdAt: user.createdAt.toISOString(),
          },
        };
      } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 11000) {
          throw new ApolloError('Email already in use', 'EMAIL_EXISTS');
        }
        throw new ApolloError('Failed to create account', 'SIGNUP_FAILED');
      }
    },
    login: async (_, { email, password }) => {
      if (!email || !password) {
        throw new ApolloError('Email and password are required', 'INVALID_INPUT');
      }

      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          throw new AuthenticationError('Invalid email or password');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new AuthenticationError('Invalid email or password');
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
            createdAt: user.createdAt.toISOString(),
          },
        };
      } catch (error) {
        console.error('Login error:', error);
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new ApolloError('Failed to login', 'LOGIN_FAILED');
      }
    },
    loginWithGoogle: async () => {
      throw new ApolloError('Google Sign-In not implemented', 'NOT_IMPLEMENTED');
    },
  },
};

export default authResolver;