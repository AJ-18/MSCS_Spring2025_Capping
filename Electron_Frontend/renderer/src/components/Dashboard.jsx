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
  const baseUrl = 'http://localhost:8080';
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
  if (loadingDevices) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // Main dashboard render
  return (
    <div className="p-4">
      {/* Devices Section - Lists all registered devices */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Your Devices</h2>
          <button
            onClick={handleAddDevice}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Current Device
          </button>
        </div>
        
        {/* Error display section */}
        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}
        
        {/* Conditional rendering based on loading state and devices */}
        {loadingDevices ? (
          <p>Loading devices...</p>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Map through devices and render device cards */}
            {devices.map((device, index) => (
              <div 
                key={device.deviceId || index} 
                className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleDeviceSelect(device.deviceId || `device-${index}`)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg mb-2">{device.deviceName}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">Type: {device.systemType?.includes('64') ? 'Desktop' : 'Mobile'}</p>
                <p className="text-gray-600 text-sm mb-1">Manufacturer: {device.manufacturer}</p>
                <p className="text-gray-600 text-sm mb-1">Model: {device.model}</p>
                <p className="text-gray-600 text-sm mb-1">Last Seen: {new Date().toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No devices found. Add a device to start collecting metrics.</p>
        )}
      </div>

      {/* Device Registration Prompt - Modal dialog for confirming device registration */}
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
  );
};

export default Dashboard;