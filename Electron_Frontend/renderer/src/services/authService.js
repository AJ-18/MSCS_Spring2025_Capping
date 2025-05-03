import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = 'http://localhost:8080';

// Mock user database for development/testing
const mockUsers = new Map();

/**
 * Authentication Service
 * Handles user authentication operations including registration, login, and token verification
 */
const authService = {
  /**
   * Register a new user
   * Sends signup request to the backend API
   * 
   * @param {Object} params - Registration parameters
   * @param {string} params.username - User's chosen username
   * @param {string} params.email - User's email address
   * @param {string} params.password - User's password
   * @returns {Promise<Object>} - Response containing token and user information
   * @throws {Error} - If registration fails
   */
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

  /**
   * Login user
   * Authenticates user credentials with the backend
   * 
   * @param {Object} params - Login parameters
   * @param {string} params.username - User's username
   * @param {string} params.password - User's password
   * @returns {Promise<Object>} - Response containing token and user information
   * @throws {Error} - If login fails
   */
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

  /**
   * Verify token
   * Simple verification for protected routes
   * 
   * @param {string} token - JWT token to verify
   * @returns {boolean} - Whether token exists
   */
  verifyToken: async (token) => {
    // Just check if token exists
    return !!token;
  }
};

export default authService; 