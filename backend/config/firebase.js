
console.warn('⚠️ Using mock Firebase Admin SDK - Replace with real implementation in production');

// Mock Firebase Admin SDK
const mockAdmin = {
  auth: () => ({
    verifyIdToken: async (idToken) => {
      // Mock token verification for development
      if (!idToken || idToken === 'invalid_token') {
        const error = new Error('Invalid token');
        error.code = 'auth/invalid-id-token';
        throw error;
      }

      // Return mock decoded token
      return {
        uid: `firebase_${Date.now()}`,
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://via.placeholder.com/100',
        email_verified: true,
        firebase: {
          sign_in_provider: 'google.com'
        }
      };
    },
    
    getUserByEmail: async (email) => {
      // Mock user lookup
      return {
        uid: `firebase_${Buffer.from(email).toString('base64')}`,
        email,
        displayName: email.split('@')[0],
        photoURL: 'https://via.placeholder.com/100',
        emailVerified: true
      };
    },
    
    createUser: async (userRecord) => {
      // Mock user creation
      return {
        uid: `firebase_${Date.now()}`,
        ...userRecord
      };
    }
  }),
  
  credential: {
    cert: (serviceAccount) => ({
      // Mock credential
      projectId: process.env.FIREBASE_PROJECT_ID || 'mock-project'
    })
  },
  
  initializeApp: (config) => {
    console.log('🔥 Mock Firebase Admin initialized with project:', config?.credential?.projectId);
    return mockAdmin;
  }
};

// Initialize mock Firebase Admin
const app = mockAdmin.initializeApp({
  credential: mockAdmin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID || 'tracker-88ea9'
  })
});

export const auth = mockAdmin.auth();
export default mockAdmin;

// TODO: Replace with real Firebase Admin SDK implementation:
/*
import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

export const auth = admin.auth();
export default admin;
*/