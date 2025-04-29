import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [showDevicePrompt, setShowDevicePrompt] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const baseUrl = 'http://localhost:8080';
  const navigate = useNavigate();

  // Fetch user's devices
  const fetchUserDevices = async () => {
    setLoadingDevices(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user || !user.id) {
        console.error('User data not found');
        return;
      }

      // Get current device info
      const currentDeviceInfo = await getCurrentDeviceInfo();
      
      // Fetch devices using the GET endpoint
      console.log('Fetching devices with userId:', user.id);
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
      const deviceList = Array.isArray(data) ? data : [];
      setDevices(deviceList);
      
      // Check if current device exists
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
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to fetch devices. Please try again later.');
    } finally {
      setLoadingDevices(false);
    }
  };

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

  const handleAddDevice = async () => {
    setShowDevicePrompt(true);
  };

  const handleDevicePromptResponse = async (shouldRegister) => {
    if (shouldRegister) {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user || !user.id) {
          console.error('User data not found');
          setShowDevicePrompt(false);
          return;
        }

        console.log('Registering device...');
        const deviceId = await window.metrics.registerDevice(
          baseUrl,
          token,
          user.id
        );
        
        console.log('Device registered with ID:', deviceId);
        localStorage.setItem('deviceId', deviceId);
        
        // Start metrics collection
        await window.metrics.start({ 
          baseUrl, 
          jwt: token, 
          userId: user.id, 
          deviceId 
        });
        
        // Refresh devices list
        fetchUserDevices();
      } catch (err) {
        console.error('Failed to register device:', err);
      }
    }
    setShowDevicePrompt(false);
  };

  const handleDeviceSelect = (deviceId) => {
    localStorage.setItem('selectedDeviceId', deviceId);
    localStorage.setItem('deviceId', deviceId); // Also set the current deviceId
    navigate(`/dashboard/device/${deviceId}`);
  };

  useEffect(() => {
    // Fetch devices
    fetchUserDevices();

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (loadingDevices) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="p-4">
      {/* Devices Section */}
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
        
        {loadingDevices ? (
          <p>Loading devices...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
};

export default Dashboard;