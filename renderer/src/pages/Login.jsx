// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import validators from '../utils/validators';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDevicePrompt, setShowDevicePrompt] = useState(false);
  const baseUrl = 'http://localhost:8080';

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

  const handleDevicePromptResponse = async (shouldRegister, token, user) => {
    console.log('Device prompt response:', shouldRegister ? 'Yes' : 'No');
    if (shouldRegister) {
      try {
        console.log('Registering device...');
        const deviceId = await window.metrics.registerDevice(
          baseUrl,
          token,
          user.id
        );
        console.log('Device registered with ID:', deviceId);
        localStorage.setItem('deviceId', deviceId);
        await window.metrics.start({ baseUrl, jwt: token, userId: user.id, deviceId });
      } catch (err) {
        console.error('Failed to register device:', err);
      }
    } else {
      console.log('User declined device registration');
    }
    setShowDevicePrompt(false);
    navigate('/dashboard');
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validators.validateLoginForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate
      const { token, user } = await authService.login(formData);
      console.log('Login successful, user:', user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 2. Get current device info
      const currentDeviceInfo = await getCurrentDeviceInfo();
      
      if (!currentDeviceInfo) {
        console.error('Could not get device information');
        navigate('/dashboard');
        return;
      }

      // 3. Check existing devices
      try {
        console.log('Fetching user devices...');
        const { data: existingDevices } = await axios.post(
          `${baseUrl}/api/users/${user.id}/devices`,
          currentDeviceInfo,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('User devices:', existingDevices);

        // 4. Check if current device exists in the list
        console.log('Current device:', {
          deviceName: currentDeviceInfo.deviceName,
          model: currentDeviceInfo.model
        });
        
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
          // Device exists, start metrics collection
          console.log('Device exists, starting metrics collection');
          const matchingDevice = existingDevices.find(
            device => 
              device.deviceName === currentDeviceInfo.deviceName && 
              device.model === currentDeviceInfo.model
          );
          
          console.log('Found matching device:', matchingDevice);
          const deviceId = matchingDevice.deviceId || matchingDevice.id;
          
          localStorage.setItem('deviceId', deviceId);
          await window.metrics.start({ baseUrl, jwt: token, userId: user.id, deviceId });
          navigate('/dashboard');
        } else {
          // Show prompt to add device
          console.log('Device not found, showing prompt');
          setShowDevicePrompt(true);
        }
      } catch (err) {
        console.error('Failed to fetch devices:', err);
        navigate('/dashboard');
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // This effect will log when showDevicePrompt changes
  React.useEffect(() => {
    console.log('showDevicePrompt state changed:', showDevicePrompt);
  }, [showDevicePrompt]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
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
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
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
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>
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

        {/* Device Registration Prompt */}
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
