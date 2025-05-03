import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard Component
 * 
 * Main dashboard view that displays all registered devices for the logged-in user.
 * Allows users to:
 *  - View all their devices
 *  - Add the current device to their account
 *  - Select a device to view its detailed metrics
 * 
 * Handles device registration and automatic device detection.
 */
const Dashboard = () => {
  // State for error messages
  const [error, setError] = useState(null);
  // State to store user's registered devices
  const [devices, setDevices] = useState([]);
  // State to control the device registration prompt modal
  const [showDevicePrompt, setShowDevicePrompt] = useState(false);
  // State to track loading status of devices
  const [loadingDevices, setLoadingDevices] = useState(true);
  // API base URL for backend requests
  const baseUrl = 'https://mscs-spring2025-capping.onrender.com';
  // React Router navigation hook
  const navigate = useNavigate();

  /**
   * Fetches all devices registered to the current user
   * Updates the devices state and checks if current device is registered
   */
  const fetchUserDevices = async () => {
    setLoadingDevices(true);
    setError(null); // Clear any previous errors
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      let user;
      
      // Parse user data from localStorage with error handling
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (parseError) {
        console.error('Failed to parse user data:', parseError);
        user = {};
      }
      
      // Validate required user data is available
      if (!token || !user || !user.id) {
        console.error('User data not found', { hasToken: !!token, user });
        setError('User data not found. Please try logging in again.');
        setLoadingDevices(false);
        return;
      }

      // Get current device info for comparison with registered devices
      const currentDeviceInfo = await getCurrentDeviceInfo();
      
      // Fetch registered devices from the API
      console.log('Fetching devices with userId:', user.id);
      try {
        const { data } = await axios.get(
          `${baseUrl}/api/users/${user.id}/getdevices`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('User devices response:', data);
        // Ensure data is an array, otherwise use empty array
        const deviceList = Array.isArray(data) ? data : [];
        setDevices(deviceList);
        
        // Check if current device matches any registered device
        if (currentDeviceInfo && deviceList.length > 0) {
          console.log('Checking if current device exists in the list...');
          const deviceExists = deviceList.some(
            device => {
              console.log('Comparing device:', device.deviceName, 'with current:', currentDeviceInfo.deviceName);
              return device.deviceName === currentDeviceInfo.deviceName && 
                    device.model === currentDeviceInfo.model;
            }
          );
          console.log('Device exists:', deviceExists);
          
          // If device exists, store its ID in localStorage for reference
          if (deviceExists) {
            // Find the matching device and store its ID
            const matchingDevice = deviceList.find(
              device => device.deviceName === currentDeviceInfo.deviceName && 
                      device.model === currentDeviceInfo.model
            );
            if (matchingDevice) {
              const deviceId = matchingDevice.deviceId || matchingDevice.id;
              localStorage.setItem('deviceId', deviceId);
              console.log('Set deviceId in localStorage:', deviceId);
            }
          }
        }
      } catch (apiError) {
        // Handle API errors
        console.error('API error fetching devices:', apiError);
        if (apiError.response) {
          console.error('API response:', apiError.response.status, apiError.response.data);
        }
        setError('Failed to fetch devices. Please try again later.');
      }
    } catch (err) {
      // Handle general errors
      console.error('Error in fetchUserDevices:', err);
      setError('Failed to fetch devices. Please try again later.');
    } finally {
      // Always set loading to false when done, regardless of success/failure
      setLoadingDevices(false);
    }
  };

  /**
   * Gets information about the current device using the metrics API
   * @returns {Object|null} Device information or null if unavailable
   */
  const getCurrentDeviceInfo = async () => {
    if (window.metrics?.getDeviceInfo) {
      try {
        const deviceInfo = await window.metrics.getDeviceInfo();
        console.log('Current device info:', deviceInfo);
        return deviceInfo;
      } catch (err) {
        console.error('Error getting device info:', err);
      }
    }
    return null;
  };

  /**
   * Handles adding the current device to the user's account
   * Shows confirmation prompt to the user
   */
  const handleAddDevice = async () => {
    const deviceInfo = await getCurrentDeviceInfo();
    if (!deviceInfo) {
      setError('Failed to get device information. Please try again.');
      return;
    }
    setShowDevicePrompt(true);
  };

  /**
   * Handles user response to the device registration prompt
   * @param {boolean} shouldRegister - User's decision to register the device
   */
  const handleDevicePromptResponse = async (shouldRegister) => {
    if (shouldRegister) {
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        let user;
        
        // Parse user data with error handling
        try {
          user = JSON.parse(localStorage.getItem('user') || '{}');
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          setError('Invalid user data. Please try logging in again.');
          setShowDevicePrompt(false);
          return;
        }
        
        // Validate user data
        if (!token || !user || !user.id) {
          console.error('User data not found', { hasToken: !!token, user });
          setError('User data not found. Please try logging in again.');
          setShowDevicePrompt(false);
          return;
        }

        console.log('Registering device for user:', user.id);
        try {
          // Register device using metrics API
          const deviceId = await window.metrics.registerDevice(
            baseUrl,
            token,
            user.id
          );
          
          console.log('Device registered with ID:', deviceId);
          // Store device ID and registration preference
          localStorage.setItem('deviceId', deviceId);
          localStorage.setItem('deviceRegistrationOpted', 'true');
          
          // Start metrics collection for the device
          await window.metrics.start({ 
            baseUrl, 
            jwt: token, 
            userId: user.id, 
            deviceId 
          });
          
          // Refresh devices list to include the newly added device
          fetchUserDevices();
        } catch (apiError) {
          // Handle API errors during device registration
          console.error('Failed to register device:', apiError);
          if (apiError.response) {
            console.error('API response:', apiError.response.status, apiError.response.data);
          }
          setError(`Failed to register device: ${apiError.message || 'Unknown error'}`);
        }
      } catch (err) {
        // Handle general errors
        console.error('Error in device registration:', err);
        setError('Failed to register device. Please try again later.');
      }
    } else {
      // User declined to add device
      localStorage.setItem('deviceRegistrationOpted', 'false');
    }
    // Close the prompt when done
    setShowDevicePrompt(false);
  };

  /**
   * Handles user selection of a device to view its details
   * @param {string} deviceId - ID of the selected device
   */
  const handleDeviceSelect = (deviceId) => {
    localStorage.setItem('selectedDeviceId', deviceId);
    localStorage.setItem('deviceId', deviceId); // Also set the current deviceId
    navigate(`/dashboard/device/${deviceId}`);
  };

  // Initialize the dashboard when component mounts
  useEffect(() => {
    // Fetch devices when component mounts
    fetchUserDevices();

    return () => {
      // Cleanup if needed
    };
  }, []); // Empty dependency array means this runs once when component mounts

  // Show loading indicator while fetching devices
  if (loadingDevices) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <span className="ml-3 text-indigo-600">Loading your dashboard...</span>
    </div>
  );

  // Main dashboard render
  return (
    <div className="p-4 mx-auto max-w-7xl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Your SPAR Dashboard</h1>
        <p className="opacity-80">Monitor and analyze your system performance across all your devices.</p>
      </div>

      {/* System Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <svg className="w-6 h-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Registered Devices</p>
                <p className="text-2xl font-bold text-gray-700">{devices.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Online Devices</p>
                <p className="text-2xl font-bold text-gray-700">{devices.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <svg className="w-6 h-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Last Activity</p>
                <p className="text-lg font-bold text-gray-700">Just Now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Devices Section - Lists all registered devices */}
      <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Devices</h2>
            <p className="text-gray-500 text-sm">Select a device to view detailed metrics</p>
          </div>
          <button
            onClick={handleAddDevice}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-md hover:from-indigo-700 hover:to-blue-600 transition-colors shadow-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Current Device
          </button>
        </div>
        
        {/* Error display section */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Conditional rendering based on loading state and devices */}
        {loadingDevices ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-indigo-600">Loading devices...</span>
          </div>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Map through devices and render device cards */}
            {devices.map((device, index) => (
              <div 
                key={device.deviceId || index} 
                className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden"
                onClick={() => handleDeviceSelect(device.deviceId || `device-${index}`)}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-full opacity-50"></div>
                
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">{device.deviceName}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                    Online
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="text-sm font-medium text-gray-700">{device.systemType?.includes('64') ? 'Desktop' : 'Mobile'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                    <p className="text-sm font-medium text-gray-700">{device.manufacturer}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Model</p>
                    <p className="text-sm font-medium text-gray-700">{device.model}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Last Seen</p>
                    <p className="text-sm font-medium text-gray-700">{new Date().toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center">
                    View Details
                    <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-blue-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
            <p className="text-gray-600 mb-4">Add your first device to start collecting metrics</p>
            <button
              onClick={handleAddDevice}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add This Device
            </button>
          </div>
        )}
      </div>

      {/* Device Registration Prompt - Modal dialog for confirming device registration */}
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

export default Dashboard;