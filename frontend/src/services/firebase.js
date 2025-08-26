// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "tracker-88ea9.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tracker-88ea9",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "tracker-88ea9.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Initiating Google Sign-In...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    console.log('✅ Google Sign-In successful');
    return {
      user,
      idToken,
      credential: GoogleAuthProvider.credentialFromResult(result)
    };
  } catch (error) {
    console.error('❌ Google Sign-In failed:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked. Please allow pop-ups and try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw new Error(error.message || 'Google Sign-In failed. Please try again.');
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ Sign out failed:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
};

// Mock Google Sign-In for development (when Firebase is not properly configured)
export const mockGoogleSignIn = async () => {
  console.log('🧪 Using mock Google Sign-In for development');
  
  // Return mock data that matches Firebase structure
  return {
    user: {
      uid: `mock_${Date.now()}`,
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://via.placeholder.com/100',
      getIdToken: async () => `mock_token_${Date.now()}`
    },
    idToken: `mock_token_${Date.now()}`,
    credential: null
  };
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return process.env.REACT_APP_FIREBASE_API_KEY && 
         process.env.REACT_APP_FIREBASE_API_KEY !== "demo-api-key";
};

export default app;
