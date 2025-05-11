import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingScreen from '../LoadingScreen';
import { fetchBatteryInfo, fetchDeviceSpecifications } from '../../services/systemMetrics';

/**
 * BatteryMetrics Component
 * 
 * Displays detailed battery information for a specific device.
 * Shows battery percentage, charging status, and power consumption.
 * Handles different device types (laptops with batteries vs. desktops without).
 * Simple, clean layout optimized for at-a-glance information.
 */
const BatteryMetrics = () => {
  // Extract deviceId from URL parameters
  const { deviceId } = useParams();
  // State to store battery information
  const [batteryInfo, setBatteryInfo] = useState(null);
  // State to store device name
  const [deviceName, setDeviceName] = useState('Unknown Device');
  // State to track and display any errors
  const [error, setError] = useState(null);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // State to track if initial data has been loaded
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  // State to track if device has a battery
  const [hasBattery, setHasBattery] = useState(true);
  // State to track device form factor (desktop, laptop, etc.)
  const [deviceType, setDeviceType] = useState('');

  // Effect hook to fetch device name
  useEffect(() => {
    const getDeviceName = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (userId && deviceId) {
          const deviceData = await fetchDeviceSpecifications(userId, deviceId);
          if (deviceData && deviceData.deviceName) {
            setDeviceName(deviceData.deviceName);
            
            // Try to determine device type from device name or specifications
            const name = deviceData.deviceName.toLowerCase();
            if (name.includes('desktop') || 
                name.includes('tower') || 
                name.includes('workstation') ||
                name.includes('server') ||
                // Look for motherboard names that indicate desktop
                name.includes('b550') || 
                name.includes('b650') || 
                name.includes('x570') ||
                name.includes('z690') ||
                name.includes('aorus') || // Common gaming motherboard brand
                name.includes('rog') ||   // Republic of Gamers (desktop-focused)
                name.includes('asrock')) {
              setDeviceType('desktop');
            } else if (name.includes('laptop') || 
                     name.includes('notebook') || 
                     name.includes('macbook')) {
              setDeviceType('laptop');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching device name:', error);
      }
    };
    
    getDeviceName();
  }, [deviceId]);

  // Effect hook to fetch battery metrics data
  useEffect(() => {
    // Function to load battery information from the API
    const loadBatteryInfo = async () => {
      try {
        // Only show loading indicator on initial load
        if (!initialLoadComplete) {
          setLoading(true);
        }
        
        // Get user ID from localStorage (stored during login)
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        // Validate required parameters
        if (!userId || !deviceId) {
          console.error('Missing user ID or device ID:', { userId, deviceId });
          setError('Missing user ID or device ID. Please make sure you are logged in and have a device selected.');
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        // Fetch battery information
        const data = await fetchBatteryInfo(userId, deviceId);
        
        // Validate the returned data
        if (!data) {
          console.error('No battery data received');
          setError('No battery data received from server');
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        // Check if device has a battery
        setHasBattery(!!data.hasBattery);
        
        // Update state with the battery data
        setBatteryInfo({
          percentage: data.batteryPercentage || 0,
          isCharging: data.isCharging || false,
          powerConsumption: data.powerConsumption || 0,
          timestamp: new Date().toISOString()
        });
        
        // Clear any previous errors
        setError(null);
        
        // Set loading to false and mark initial load as complete
        setLoading(false);
        setInitialLoadComplete(true);
      } catch (error) {
        // Log error to console for debugging
        console.error('Error loading battery metrics:', error);
        // Set user-friendly error message
        setError(`Failed to load battery information: ${error.message}`);
        // Clear battery info when error occurs
        setBatteryInfo(null);
        // Set loading to false and mark initial load as complete
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    // Call the function to load data
    loadBatteryInfo();
    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(loadBatteryInfo, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [deviceId, initialLoadComplete]); // Re-run effect when deviceId changes

  // Render error state if there's an error
  if (error) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <Link
            to={`/dashboard/device/${deviceId}`}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Device Overview
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Battery Status</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Render loading state only during initial data loading
  if (loading && !initialLoadComplete) {
    return <LoadingScreen message="Loading battery information..." />;
  }

  // Show main content if we have battery data, or after initial load
  const displayBatteryInfo = batteryInfo || {
    percentage: 0,
    isCharging: false,
    powerConsumption: 0,
    timestamp: new Date().toISOString()
  };

  // Content for devices with no battery (like desktops)
  const noBatteryContent = (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Power Information</h2>
      
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-6 text-center w-full">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Desktop Computer Detected</h3>
          <p className="text-gray-600">
            This device doesn't have a battery. It's likely a desktop computer that is powered directly from a wall outlet.
          </p>
        </div>
      </div>
      
      <div className="space-y-4 divide-y divide-gray-100">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Device Name</span>
          <span className="text-gray-900 font-medium">{deviceName}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Device Type</span>
          <span className="text-gray-900 font-medium capitalize">
            {deviceType || 'Desktop Computer'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Power Source</span>
          <span className="text-gray-900 font-medium">AC Power (Wall Outlet)</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Time Stamp</span>
          <span className="text-gray-900 font-medium text-sm">
            {new Date(displayBatteryInfo.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  // Content for devices with batteries (like laptops)
  const batteryContent = (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Battery Status</h2>
      
      {/* Battery Percentage Visualization */}
      <div className="mb-6 border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 font-medium">Battery</span>
          <span className="text-gray-900 font-bold">{displayBatteryInfo.percentage}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ease-in-out ${
              displayBatteryInfo.percentage <= 20 ? 'bg-red-500' : 
              displayBatteryInfo.percentage <= 50 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.max(5, displayBatteryInfo.percentage)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Device Information */}
      <div className="space-y-4 divide-y divide-gray-100">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Device Name</span>
          <span className="text-gray-900 font-medium">{deviceName}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Device Type</span>
          <span className="text-gray-900 font-medium capitalize">
            {deviceType || 'Laptop'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Charging</span>
          <span className="text-gray-900 font-medium">
            {displayBatteryInfo.isCharging ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Power Consumption</span>
          <span className="text-gray-900 font-medium">
            {typeof displayBatteryInfo.powerConsumption === 'number' 
              ? `${displayBatteryInfo.powerConsumption.toFixed(2)} W` 
              : '0.00 W'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Time Stamp</span>
          <span className="text-gray-900 font-medium text-sm">
            {new Date(displayBatteryInfo.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  // Main component render with appropriate content based on device type
  return (
    <div className="p-4">
      <div className="mb-6">
        <Link
          to={`/dashboard/device/${deviceId}`}
          className="text-blue-500 hover:text-blue-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Device Overview
        </Link>
      </div>

      {hasBattery ? batteryContent : noBatteryContent}
    </div>
  );
};

export default BatteryMetrics; 