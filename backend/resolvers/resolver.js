import User from '../model/User.js'; // Fixed import path
import jwt from 'jsonwebtoken';
import { AuthenticationError, ApolloError } from 'apollo-server-express';
import dotenv from 'dotenv';
// Remove Firebase import since serviceAccountKey.json is missing
// We'll implement a mock verification for development

dotenv.config();

// Mock Firebase token verification for development
// In production, you'd use actual Firebase Admin SDK
const mockVerifyIdToken = async (idToken) => {
  // This is a development mock - replace with real Firebase verification
  if (!idToken || idToken === 'invalid_token') {
    throw new Error('Invalid token');
  }
  
  // Extract user info from a mock token or use default values
  // In production, this would come from Firebase
  const mockUserData = {
    uid: `firebase_${Date.now()}`, // Generate a unique UID
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://via.placeholder.com/100'
  };

  // For development, allow any token that looks like an email
  if (idToken.includes('@')) {
    return {
      uid: `firebase_${Buffer.from(idToken).toString('base64')}`,
      name: idToken.split('@')[0],
      email: idToken,
      picture: 'https://via.placeholder.com/100'
    };
  }

  return mockUserData;
};

const authResolver = {
  Mutation: {
    loginWithGoogle: async (_, { idToken }) => {
      // Enhanced input validation
      if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
        throw new ApolloError('Invalid or missing ID token', 'INVALID_INPUT');
      }

      try {
        console.log(`🔐 Attempting authentication with token: ${idToken.substring(0, 20)}...`);

        // Use mock verification for development
        // TODO: Replace with actual Firebase Admin SDK verification
        const decodedToken = await mockVerifyIdToken(idToken.trim());
        const { uid, name, email, picture } = decodedToken;

        console.log(`👤 Authenticating user: ${email}`);

        // Find or create user in MongoDB
        let user = await User.findOne({ firebaseUid: uid });
        
        if (!user) {
          // Create new user
          user = new User({
            firebaseUid: uid,
            name: name || email.split('@')[0], // Fallback to email prefix if no name
            email,
            avatar: picture || '', // Use Google profile picture if available
            lastLoginAt: new Date()
          });
          await user.save();
          console.log(`✨ Created new user: ${user.email} (${user._id})`);
        } else {
          // Update existing user's last login and potentially update info
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

        // Generate JWT with enhanced payload
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

        // Return AuthPayload
        const authPayload = {
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

        console.log(`✅ Authentication successful for ${user.email}`);
        return authPayload;

      } catch (error) {
        console.error('❌ Login error:', error);

        // Handle specific error types
        if (error.message.includes('Invalid token') || error.message.includes('auth/')) {
          throw new AuthenticationError('Invalid Google ID token provided');
        }

        if (error.name === 'ValidationError') {
          throw new ApolloError(`User validation failed: ${error.message}`, 'VALIDATION_ERROR');
        }

        if (error.code === 11000) {
          // MongoDB duplicate key error
          throw new ApolloError('User with this email already exists', 'USER_EXISTS');
        }

        // Generic error
        throw new ApolloError('Authentication failed. Please try again.', 'AUTH_FAILED');
      }
    },
  },
};

export default authResolver;