import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setError(null);
        console.log('🔍 Checking authentication status...');
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('📝 No auth token found');
          setLoading(false);
          return;
        }

        console.log('🎫 Auth token found, verifying...');
        apiService.setAuthToken(token);
        
        // Test the connection first
        const isConnected = await apiService.healthCheck();
        if (!isConnected) {
          console.warn('⚠️ Server appears to be down, using cached auth');
          setLoading(false);
          return;
        }

        const userData = await apiService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Authentication verified for:', userData.email);
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setError(error.message);
        // Clear invalid token
        localStorage.removeItem('authToken');
        apiService.clearAuthToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (idToken) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Starting login process...');
      
      const response = await apiService.loginWithGoogle(idToken);
      setUser(response.user);
      setIsAuthenticated(true);
      console.log('✅ Login successful for:', response.user.email);
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock login for development
  const mockLogin = async (email = 'test@example.com') => {
    try {
      setLoading(true);
      setError(null);
      console.log('🧪 Starting mock login for development...');
      
      const response = await apiService.mockLogin(email);
      setUser(response.user);
      setIsAuthenticated(true);
      console.log('✅ Mock login successful for:', response.user.email);
      return response;
    } catch (error) {
      console.error('❌ Mock login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Logging out...');
      
      apiService.clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Get connection status
  const getConnectionStatus = () => {
    return apiService.getConnectionStatus();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    mockLogin, // For development
    logout,
    clearError,
    getConnectionStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};