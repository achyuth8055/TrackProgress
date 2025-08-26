// Enhanced API service with better error handling and retry logic
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;
const CHAT_ENDPOINT = `${API_BASE_URL}/chat`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.warn('📡 Connection lost');
    });
  }

  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
    console.log('🔐 Auth token set');
  }

  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    console.log('🔓 Auth token cleared');
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Enhanced request wrapper with retry logic
  async makeRequest(url, options = {}, retries = 3) {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    const requestOptions = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📤 Making request to ${url} (attempt ${attempt}/${retries})`);
        
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`📥 Request successful to ${url}`);
        return data;

      } catch (error) {
        console.error(`❌ Request failed (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // GraphQL request helper with enhanced error handling
  async graphqlRequest(query, variables = {}) {
    try {
      const result = await this.makeRequest(GRAPHQL_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (result.errors) {
        const error = result.errors[0];
        console.error('GraphQL Error:', error);
        throw new Error(error.message || 'GraphQL request failed');
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        this.clearAuthToken();
        throw new Error('Authentication expired. Please login again.');
      }
      
      throw error;
    }
  }

  // Auth methods
  async loginWithGoogle(idToken) {
    console.log('🔐 Attempting Google login...');
    
    const query = `
      mutation LoginWithGoogle($idToken: String!) {
        loginWithGoogle(idToken: $idToken) {
          token
          user {
            id
            name
            email
            avatar
            createdAt
          }
        }
      }
    `;

    try {
      const data = await this.graphqlRequest(query, { idToken });
      
      if (data.loginWithGoogle.token) {
        this.setAuthToken(data.loginWithGoogle.token);
        console.log('✅ Google login successful');
      }

      return data.loginWithGoogle;
    } catch (error) {
      console.error('❌ Google login failed:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  // Mock login for development (when Firebase is not available)
  async mockLogin(email = 'test@example.com') {
    console.log('🧪 Using mock login for development');
    
    try {
      // Use email as mock token for development
      const mockResponse = await this.loginWithGoogle(email);
      return mockResponse;
    } catch (error) {
      console.error('❌ Mock login failed:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    const query = `
      query Me {
        me {
          id
          name
          email
          avatar
          createdAt
        }
      }
    `;

    try {
      console.log('👤 Fetching current user...');
      const data = await this.graphqlRequest(query);
      console.log('✅ Current user fetched successfully');
      return data.me;
    } catch (error) {
      console.error('❌ Failed to fetch current user:', error);
      // If auth fails, clear token
      if (error.message.includes('Authentication')) {
        this.clearAuthToken();
      }
      throw error;
    }
  }

  // Chat with AI Assistant
  async chatWithAssistant(message) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Please provide a valid message');
    }

    if (message.length > 1000) {
      throw new Error('Message too long. Please keep it under 1000 characters.');
    }

    try {
      console.log('💬 Sending message to AI assistant...');
      
      const data = await this.makeRequest(CHAT_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ message: message.trim() }),
      });

      console.log('✅ AI response received');
      return data.reply || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('❌ Chat request failed:', error);
      throw new Error(error.message || 'Failed to get response from AI assistant');
    }
  }

  // Health check with enhanced info
  async healthCheck() {
    try {
      console.log('💓 Checking server health...');
      const data = await this.makeRequest(HEALTH_ENDPOINT);
      console.log('✅ Server is healthy:', data);
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return null;
    }
  }

  // Test GraphQL connection
  async testGraphQLConnection() {
    try {
      const query = `query { health }`;
      const result = await this.graphqlRequest(query);
      return result.health === 'Server is running!';
    } catch (error) {
      console.error('❌ GraphQL connection test failed:', error);
      return false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      hasToken: !!this.token,
      apiBaseUrl: API_BASE_URL
    };
  }
}

// Create and export singleton instance
const apiService = new ApiService();

// Add some debugging helpers for development
if (process.env.NODE_ENV === 'development') {
  window.apiService = apiService;
  console.log('🔧 API Service available as window.apiService for debugging');
}

export default apiService;