import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DeviceList Component
 * 
 * Displays a grid of registered devices for the current user
 * Shows device name, type, status, and last active timestamp
 * Allows user to select a device to view detailed information
 * 
 * Currently uses mock data, but designed to be extended for API integration
 */
const DeviceList = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  // State to store the list of user's devices
  const [devices, setDevices] = useState([]);
  // Get current device ID from localStorage for identification
  const currentDeviceId = localStorage.getItem('deviceId');

  // Effect hook to initialize devices list
  useEffect(() => {
    // For now, we'll just show the current device
    // In a real app, this would fetch from an API
    setDevices([
      {
        id: currentDeviceId,
        name: 'MyComputer',
        type: 'Desktop',
        lastSeen: new Date().toISOString(),
        status: 'Online'
      }
    ]);
  }, [currentDeviceId]); // Re-run effect when currentDeviceId changes

  /**
   * Handles selection of a device from the list
   * Stores the selected device ID in localStorage and navigates to device details
   * 
   * @param {string} deviceId - The ID of the selected device
   */
  const handleDeviceSelect = (deviceId) => {
    localStorage.setItem('selectedDeviceId', deviceId);
    // Don't set deviceId as it should represent the current device
    // localStorage.setItem('deviceId', deviceId);
    navigate(`/dashboard/device/${deviceId}`);
  };

  // Main component render with device grid
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Devices</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Map through devices array to create device cards */}
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDeviceSelect(device.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{device.name}</h3>
              {/* Status indicator with color coding */}
              <span className={`px-2 py-1 rounded-full text-xs ${
                device.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {device.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Type: {device.type}</p>
              <p>Last Seen: {new Date(device.lastSeen).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList; 