// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import validators from '../utils/validators';

/**
 * Login Component
 * 
 * Handles user authentication and login process
 * Manages device registration flow after successful login
 * Validates form inputs and displays appropriate error messages
 * Implements security features like input sanitization
 */
const Login = () => {
  // Navigation hook for redirecting after login
  const navigate = useNavigate();
  // Form data state for username and password
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  // Error messages for form validation and API errors
  const [errors, setErrors] = useState({});
  // Loading state for submission UI feedback
  const [loading, setLoading] = useState(false);
  // State to control device registration modal visibility
  const [showDevicePrompt, setShowDevicePrompt] = useState(false);
  // API base URL for backend requests
  const baseUrl = 'https://mscs-spring2025-capping.onrender.com';

  /**
   * Handles form input changes
   * Sanitizes input to prevent XSS attacks
   * Clears field-specific errors when user edits a field
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = validators.sanitizeInput(value);
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Handles user response to device registration prompt
   * Registers device with backend if user confirms
   * Updates localStorage with device registration preferences
   * 
   * @param {boolean} shouldRegister - Whether user agreed to register the device
   * @param {string} token - Authentication token
   * @param {Object} user - User data object
   */
  const handleDevicePromptResponse = async (shouldRegister, token, user) => {
    console.log('Device prompt response:', shouldRegister ? 'Yes' : 'No');
    if (shouldRegister) {
      try {
        // Validate required data is available
        if (!token || !user || !user.id) {
          console.error('Missing required data for device registration', { 
            hasToken: !!token, 
            hasUser: !!user,
            userId: user?.id
          });
          setErrors({ submit: 'User data not found. Please try logging in again.' });
          setShowDevicePrompt(false);
          return;
        }
        
        // Register device through metrics API
        console.log('Registering device for user:', user.id);
        try {
          const deviceId = await window.metrics.registerDevice(
            baseUrl,
            token,
            user.id
          );
          console.log('Device registered with ID:', deviceId);
          // Store device ID and registration preference in localStorage
          localStorage.setItem('deviceId', deviceId);
          localStorage.setItem('deviceRegistrationOpted', 'true');
          // Start metrics collection for the device
          await window.metrics.start({ baseUrl, jwt: token, userId: user.id, deviceId });
        } catch (apiError) {
          // Handle API errors during device registration
          console.error('Failed to register device:', apiError);
          if (apiError.response) {
            console.error('API response error:', {
              status: apiError.response.status,
              data: apiError.response.data
            });
          }
          setErrors({ submit: `Device registration failed: ${apiError.message || 'Unknown error'}` });
          setShowDevicePrompt(false);
          return;
        }
      } catch (err) {
        // Handle unexpected errors
        console.error('Error in device registration process:', err);
        setErrors({ submit: 'An error occurred during device registration.' });
        setShowDevicePrompt(false);
        return;
      }
    } else {
      // User declined device registration
      console.log('User declined device registration');
      localStorage.setItem('deviceRegistrationOpted', 'false');
    }
    // Close prompt and navigate to dashboard
    setShowDevicePrompt(false);
    navigate('/dashboard');
  };

  /**
   * Gets information about the current device using the metrics API
   * Used to check if device is already registered
   * 
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
   * Handles form submission for login
   * Validates credentials, authenticates user, and handles device registration flow
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form inputs
    const { isValid, errors: validationErrors } = validators.validateLoginForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate user with backend
      const { token, user } = await authService.login(formData);
      console.log('Login successful, user:', user);
      // Store authentication data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Check if user has already made a device registration decision
      const deviceRegistrationOpted = localStorage.getItem('deviceRegistrationOpted');
      
      // If user has previously declined device registration, skip the device registration process
      if (deviceRegistrationOpted === 'false') {
        console.log('User previously opted out of device registration, skipping device check');
        navigate('/dashboard');
        return;
      }

      // 2. Get current device information
      const currentDeviceInfo = await getCurrentDeviceInfo();
      
      if (!currentDeviceInfo) {
        console.error('Could not get device information');
        navigate('/dashboard');
        return;
      }

      // 3. Check if device is already registered
      try {
        console.log('Fetching user devices...');
        const { data: existingDevices } = await axios.get(
          `${baseUrl}/api/users/${user.id}/getdevices`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('User devices:', existingDevices);

        // 4. Check if current device exists in the user's device list
        console.log('Current device:', {
          deviceName: currentDeviceInfo.deviceName,
          model: currentDeviceInfo.model
        });
        
        // Compare current device with registered devices
        const deviceExists = Array.isArray(existingDevices) && existingDevices.some(
          device => {
            console.log('Comparing with device:', {
              deviceName: device.deviceName,
              model: device.model
            });
            return device.deviceName === currentDeviceInfo.deviceName && 
                   device.model === currentDeviceInfo.model;
          }
        );
        
        console.log('Device exists?', deviceExists);

        if (deviceExists) {
          // Device is already registered, start metrics collection
          console.log('Device exists, starting metrics collection');
          const matchingDevice = existingDevices.find(
            device => 
              device.deviceName === currentDeviceInfo.deviceName && 
              device.model === currentDeviceInfo.model
          );
          
          console.log('Found matching device:', matchingDevice);
          const deviceId = matchingDevice.deviceId || matchingDevice.id;
          
          localStorage.setItem('deviceId', deviceId);
          
          // Only start metrics collection if user previously opted in
          if (deviceRegistrationOpted === 'true') {
            await window.metrics.start({ baseUrl, jwt: token, userId: user.id, deviceId });
          }
          
          navigate('/dashboard');
        } else {
          // Device not found, show registration prompt
          console.log('Device not found, showing prompt');
          setShowDevicePrompt(true);
        }
      } catch (err) {
        // Handle error in device check
        console.error('Failed to fetch devices:', err);
        navigate('/dashboard');
      }
    } catch (err) {
      // Handle login error
      setErrors({ submit: err.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Debug effect for device prompt state changes
  React.useEffect(() => {
    console.log('showDevicePrompt state changed:', showDevicePrompt);
  }, [showDevicePrompt]);

  // Main component render with login form
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
          {/* Logo and title */}
          <div className="flex flex-col items-center">
            <img
              src="SPAR.png"
              alt="SPAR Logo"
              className="w-64 h-auto mb-6"
            />
            <h2 className="mt-2 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Monitor and analyze your system performance
            </p>
          </div>
          {/* Login form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error message display */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.submit}</div>
              </div>
            )}
            {/* Input fields */}
            <div className="space-y-4">
              {/* Username field */}
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
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              </div>
              {/* Password field */}
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
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>
            {/* Submit button */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                )}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="mt-2 text-center text-xs text-gray-500">
                By signing in, you acknowledge that SPAR will collect system performance metrics to provide analytics and insights.
              </p>
            </div>
          </form>
          {/* Registration link */}
          <div className="mt-6 text-center border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Register here
              </button>
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="flex items-start p-3 bg-indigo-50 rounded-lg">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Real-time Monitoring</h3>
                <p className="text-sm text-gray-500">Track system metrics live with detailed resource usage information</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-indigo-50 rounded-lg">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Multi-Device Monitoring</h3>
                <p className="text-sm text-gray-500">Monitor and compare performance across all your devices</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-indigo-50 rounded-lg">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Mobile Companion App</h3>
                <p className="text-sm text-gray-500">Access your system metrics on the go with our mobile app</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Registration Prompt - Modal dialog */}
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
                onClick={() => handleDevicePromptResponse(false, localStorage.getItem('token'), JSON.parse(localStorage.getItem('user')))}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                No, Thanks
              </button>
              <button
                onClick={() => handleDevicePromptResponse(true, localStorage.getItem('token'), JSON.parse(localStorage.getItem('user')))}
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

export default Login;
