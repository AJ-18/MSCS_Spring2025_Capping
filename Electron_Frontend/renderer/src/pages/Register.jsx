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
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-100 opacity-40 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-purple-100 opacity-30 blur-3xl"></div>
        
        {/* Circuit-like patterns */}
        <div className="absolute top-0 left-0 w-full h-10 border-b border-indigo-100"></div>
        <div className="absolute top-0 left-1/4 w-px h-32 bg-indigo-100"></div>
        <div className="absolute top-32 left-1/4 w-40 h-px bg-indigo-100"></div>
        <div className="absolute bottom-0 right-0 w-full h-10 border-t border-indigo-100"></div>
        <div className="absolute bottom-0 right-1/4 w-px h-32 bg-indigo-100"></div>
        <div className="absolute bottom-32 right-1/4 w-40 h-px bg-indigo-100"></div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center w-full z-10">
        <div className="max-w-md w-full p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <img
              src="SPAR.png"
              alt="SPAR Logo"
              className="w-64 h-auto mb-6"
            />
            <h2 className="mt-2 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Create your S.P.A.R account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join SPAR for comprehensive system performance analytics
            </p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.submit}</div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 shadow-md transition-all duration-150"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <p className="mt-1 text-center text-sm text-gray-600">
                After registering, please sign in
              </p>
              <p className="mt-1 text-center text-xs text-gray-500">
                By creating an account, you agree to allow SPAR to collect and analyze system performance metrics from your device(s).
              </p>
            </div>
          </form>
          <div className="mt-6 text-center border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Key Features Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Key Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600">Real-time performance monitoring</span>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600">Multi-Device Monitoring</span>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600">Mobile Companion App</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Device Registration Prompt */}
      {showDevicePrompt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl p-8 m-4 max-w-xl w-full shadow-2xl border border-indigo-50">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">Add Device</h3>
            </div>
            <p className="mb-6 text-gray-600">Would you like to add this device for metrics collection? This allows SPAR to monitor and analyze your system's performance.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleDevicePromptResponse(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                No, Thanks
              </button>
              <button
                onClick={() => handleDevicePromptResponse(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-md hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-colors"
              >
                Yes, Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register; 