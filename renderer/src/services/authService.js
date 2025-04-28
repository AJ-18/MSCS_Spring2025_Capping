import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Mock user database
const mockUsers = new Map();

// Mock authentication service
const authService = {
  // Register a new user
  register: async ({ name, username, password }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    if (mockUsers.has(username)) {
      throw new Error('User already exists with this username');
    }

    // Create new user
    const user = {
      id: crypto.randomUUID(),
      name,
      username,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString()
    };

    // Store user in mock database
    mockUsers.set(username, user);

    // Generate mock JWT token
    const token = `mock-jwt-${user.id}`;

    // Return the same structure as your future backend
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    };
  },

  // Login user
  login: async ({ username, password }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signin`, {
        username,
        password
      });

      const { token, userId } = response.data;

      // Return the same structure as expected by the app
      return {
        token,
        user: {
          id: userId,
          username
        }
      };
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error setting up the request');
      }
    }
  },

  // Verify token (for protected routes)
  verifyToken: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }
};

export default authService; 