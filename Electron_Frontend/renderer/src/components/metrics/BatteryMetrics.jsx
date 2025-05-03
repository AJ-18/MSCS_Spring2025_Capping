import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingScreen from '../LoadingScreen';
import { fetchBatteryInfo, fetchDeviceSpecifications } from '../../services/systemMetrics';

/**
 * BatteryMetrics Component
 * 
 * Displays detailed battery information for a specific device.
 * Shows battery percentage, charging status, and power consumption.
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

  // Effect hook to fetch device name
  useEffect(() => {
    const getDeviceName = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (userId && deviceId) {
          const deviceData = await fetchDeviceSpecifications(userId, deviceId);
          if (deviceData && deviceData.deviceName) {
            setDeviceName(deviceData.deviceName);
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

  // Main component render with battery metrics display in a simpler layout
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
    </div>
  );
};

export default BatteryMetrics; 