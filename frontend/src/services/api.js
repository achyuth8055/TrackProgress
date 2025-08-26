const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async graphqlRequest(query, variables = {}) {
    const response = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  async loginWithGoogle(idToken) {
    const query = `
      mutation LoginWithGoogle($idToken: String!) {
        loginWithGoogle(idToken: $idToken) {
          token
          user {
            id
            name
            email
            avatar
          }
        }
      }
    `;

    const data = await this.graphqlRequest(query, { idToken });
    const { token, user } = data.loginWithGoogle;
    
    this.setAuthToken(token);
    return { token, user };
  }

  async getCurrentUser() {
    const query = `
      query GetCurrentUser {
        me {
          id
          name
          email
          avatar
          createdAt
        }
      }
    `;

    const data = await this.graphqlRequest(query);
    return data.me;
  }

  async getCourses() {
    // Mock data for now - replace with real GraphQL query
    return [
      { id: '1', name: 'Data Structures & Algorithms', progress: 65, icon: '🧮', color: '#3b82f6' },
      { id: '2', name: 'System Design', progress: 30, icon: '⚙️', color: '#10b981' },
      { id: '3', name: 'JavaScript Fundamentals', progress: 85, icon: '💛', color: '#f59e0b' },
    ];
  }

  async getTasks() {
    // Mock data for now - replace with real GraphQL query
    return [
      { id: '1', title: 'Complete Binary Tree problems', dueDate: '2025-08-27', completed: false },
      { id: '2', title: 'Review System Design basics', dueDate: '2025-08-28', completed: false },
    ];
  }
}

export default new ApiService();
