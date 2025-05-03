import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import validators from '../utils/validators';

/**
 * Register Component
 * Handles user registration functionality and device registration prompt
 */
const Register = () => {
  // React Router hook for navigation
  const navigate = useNavigate();
  
  // State for form data management
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // Loading state for submission feedback
  const [loading, setLoading] = useState(false);
  
  // State to control device registration prompt visibility
  const [showDevicePrompt, setShowDevicePrompt] = useState(false);
  
  // API base URL
  const baseUrl = 'https://mscs-spring2025-capping.onrender.com';
  
  // State to store user data for device registration
  const [userData, setUserData] = useState(null);

  /**
   * Handles form input changes
   * Sanitizes user input and clears related errors
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitize input before setting it
    const sanitizedValue = validators.sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Handles the user's response to device registration prompt
   * Registers device if user agrees, stores preference either way
   * @param {boolean} shouldRegister - Whether user agreed to register device
   */
  const handleDevicePromptResponse = async (shouldRegister) => {
    console.log('Device prompt response:', shouldRegister ? 'Yes' : 'No');
    if (shouldRegister && userData) {
      try {
        console.log('Registering device...');
        const deviceId = await window.metrics.registerDevice(
          baseUrl,
          userData.token,
          userData.user.id
        );
        console.log('Device registered with ID:', deviceId);
        localStorage.setItem('deviceId', deviceId);
        localStorage.setItem('deviceRegistrationOpted', 'true');
        await window.metrics.start({ 
          baseUrl, 
          jwt: userData.token, 
          userId: userData.user.id, 
          deviceId 
        });
      } catch (err) {
        console.error('Failed to register device:', err);
      }
    } else {
      console.log('User declined device registration');
      // Store a flag indicating user has explicitly opted out of device registration
      localStorage.setItem('deviceRegistrationOpted', 'false');
    }
    setShowDevicePrompt(false);
    navigate('/dashboard');
  };

  /**
   * Gets current device information through metrics API
   * Uses the preload script bridge to access node.js capabilities
   * @returns {Object|null} Device information or null if unavailable
   */
  const getCurrentDeviceInfo = async () => {
    console.log('getCurrentDeviceInfo() called, window.metrics =', window.metrics);
    // This should be implemented in the preload script to get device info via Node.js
    if (window.metrics?.getDeviceInfo) {
      const deviceInfo = await window.metrics.getDeviceInfo();
      console.log('Device info:', deviceInfo);
      return deviceInfo;
    }
    console.error('getDeviceInfo method not available');
    return null;
  };

  /**
   * Handles form submission for user registration
   * Validates form, submits to API, and handles device registration prompt
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const { isValid, errors: validationErrors } = validators.validateRegistrationForm(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Call the signup API with the correct payload format
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      console.log('Registration successful:', response);
      const { token, user } = response;

      // Store the token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Save user data for device registration
      setUserData({ token, user });

      // Get current device info
      const currentDeviceInfo = await getCurrentDeviceInfo();
      
      if (!currentDeviceInfo) {
        console.error('Could not get device information');
        navigate('/dashboard');
        return;
      }

      // Show the device registration prompt
      setShowDevicePrompt(true);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({
        submit: err.message || 'Registration failed. Please try again.'
      });
      setLoading(false);
    }
  };

  // Effect to log when showDevicePrompt changes
  React.useEffect(() => {
    console.log('showDevicePrompt state changed:', showDevicePrompt);
  }, [showDevicePrompt]);

  // Component render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img
            src="SPAR.png"
            alt="SPAR Logo"
            className="w-64 h-auto mb-6"
          />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create your S.P.A.R account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.submit}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <p className="mt-2 text-center text-sm text-gray-600">
              After registering, please sign in
            </p>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* Device Registration Prompt */}
        {showDevicePrompt && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg p-8 m-4 max-w-xl w-full">
              <h3 className="text-lg font-medium mb-4">Add Device</h3>
              <p className="mb-4">Would you like to add this device for metrics collection?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleDevicePromptResponse(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  No
                </button>
                <button
                  onClick={() => handleDevicePromptResponse(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register; 