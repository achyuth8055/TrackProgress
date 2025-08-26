import { auth } from '../config/firebase.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ApolloError } from 'apollo-server-express';
import dotenv from 'dotenv';

dotenv.config();

const authResolver = {
  Mutation: {
    loginWithGoogle: async (_, { idToken }) => {
      // Validate input
      if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
        throw new ApolloError('Invalid or missing ID token', 'INVALID_INPUT');
      }

      try {
        // Verify Google ID token with Firebase
        const decodedToken = await auth.verifyIdToken(idToken.trim());
        const { uid, name, email, picture } = decodedToken;

        console.log(`Authenticating user with Firebase UID: ${uid}`);

        // Find or create user in MongoDB
        let user = await User.findOne({ firebaseUid: uid });
        if (!user) {
          user = new User({
            firebaseUid: uid,
            name: name || email.split('@')[0], // Fallback to email prefix if no name
            email,
            avatar: picture || '', // Use Google profile picture if available
          });
          await user.save();
          console.log(`Created new user: ${user.email}`);
        } else {
          console.log(`Found existing user: ${user.email}`);
        }

        // Generate JWT
        const token = jwt.sign(
          { userId: user._id.toString() },
          process.env.JWT_SECRET || 'your_jwt_secret', // Ensure JWT_SECRET is in .env
          { expiresIn: '7d' } // Token expires in 7 days
        );

        // Return AuthPayload
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
        if (error.code && error.code.includes('auth/')) {
          console.error('Firebase auth error:', error.message);
          throw new AuthenticationError('Invalid Google ID token');
        }
        console.error('Login error:', error);
        throw new ApolloError('Failed to authenticate with Google', 'AUTH_FAILED');
      }
    },
  },
};

export default authResolver;