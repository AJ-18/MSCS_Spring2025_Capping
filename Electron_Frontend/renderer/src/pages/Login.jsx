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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and title */}
        <div className="flex flex-col items-center">
          <img
            src="SPAR.png"
            alt="SPAR Logo"
            className="w-64 h-auto mb-6"
          />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
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
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>
            {/* Password field */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>
          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        {/* Registration link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Register here
            </button>
          </p>
        </div>

        {/* Device Registration Prompt - Modal dialog */}
        {showDevicePrompt && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg p-8 m-4 max-w-xl w-full">
              <h3 className="text-lg font-medium mb-4">Add Device</h3>
              <p className="mb-4">Would you like to add this device for metrics collection?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleDevicePromptResponse(false, localStorage.getItem('token'), JSON.parse(localStorage.getItem('user')))}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  No
                </button>
                <button
                  onClick={() => handleDevicePromptResponse(true, localStorage.getItem('token'), JSON.parse(localStorage.getItem('user')))}
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

export default Login;
