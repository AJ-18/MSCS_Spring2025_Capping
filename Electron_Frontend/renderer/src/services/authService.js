import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Mock user database
const mockUsers = new Map();

// Mock authentication service
const authService = {
  // Register a new user
  register: async ({ username, email, password }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        username,
        email,
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
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error setting up the request');
      }
    }
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
    // Just check if token exists
    return !!token;
  }
};

export default authService; 