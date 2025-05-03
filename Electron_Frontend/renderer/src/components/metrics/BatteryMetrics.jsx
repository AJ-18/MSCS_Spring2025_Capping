import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchBatteryInfo } from '../../services/systemMetrics';

// Mock data for development/testing purposes when real data isn't available
// This provides a consistent data structure for development
const MOCK_BATTERY_INFO = {
  hasBattery: true,
  batteryPercentage: 80,
  isCharging: false,
  powerConsumption: 12.50,
  timestamp: new Date().toISOString()
};

/**
 * BatteryMetrics Component
 * 
 * Displays detailed battery information for a specific device.
 * Shows battery percentage, charging status, and power consumption.
 * Includes conditional rendering for devices without batteries.
 */
const BatteryMetrics = () => {
  // Extract deviceId from URL parameters
  const { deviceId } = useParams();
  // State to store battery information
  const [batteryInfo, setBatteryInfo] = useState(null);
  // State to track and display any errors
  const [error, setError] = useState(null);

  // Effect hook to fetch battery metrics data
  useEffect(() => {
    // Function to load battery information from the API
    const loadBatteryInfo = async () => {
      try {
        // Get user ID from localStorage (stored during login)
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        // Use the fetchBatteryInfo service function to get battery data
        const data = await fetchBatteryInfo(userId, deviceId);
        
        // Structure the response data into a consistent format
        // Use nullish coalescing to provide fallbacks for missing data
        setBatteryInfo({
          hasBattery: data.hasBattery ?? true,
          percentage: data.batteryPercentage ?? 80,
          isCharging: data.isCharging ?? false,
          powerConsumption: data.powerConsumption ?? 12.50,
          timestamp: new Date().toISOString()
        });
        // Clear any previous errors
        setError(null);
      } catch (error) {
        // Log error to console for debugging
        console.error('Error loading battery metrics:', error);
        // Set user-friendly error message
        setError(`Failed to load battery information: ${error.message}`);
        // Clear battery info when error occurs
        setBatteryInfo(null);
      }
    };

    // Call the function to load data
    loadBatteryInfo();
    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(loadBatteryInfo, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [deviceId]); // Re-run effect when deviceId changes

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

  // Render loading state while fetching data
  if (!batteryInfo) {
    return <div className="p-4">Loading battery information...</div>;
  }

  // Render a specific view for devices without a battery
  if (!batteryInfo.hasBattery) {
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
          <p className="text-gray-500">This device does not have a battery.</p>
        </div>
      </div>
    );
  }

  // Main component render with battery metrics display
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
        <h2 className="text-2xl font-bold mb-8">Battery Status</h2>

        {/* Battery Percentage Bar - Visual representation of battery level */}
        <div className="mb-8">
          <div className="bg-gray-100 rounded-full p-1 w-full">
            <div 
              className={`text-white text-center py-2 px-4 rounded-full transition-all duration-500 ease-in-out ${
                batteryInfo.percentage > 20 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${batteryInfo.percentage}%` }}
            >
              {batteryInfo.percentage}%
            </div>
          </div>
        </div>

        {/* Battery Details - Shows charging status and power consumption */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">Status</span>
            <span className="font-medium flex items-center">
              {batteryInfo.isCharging ? (
                <>
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 00-1 1v1.268a2 2 0 01-1.732 1.982l-.284.064a2 2 0 00-1.732 1.982V9a1 1 0 001 1h6a1 1 0 001-1V8.296a2 2 0 00-1.732-1.982l-.284-.064A2 2 0 0011 4.268V3a1 1 0 00-1-1z" />
                  </svg>
                  Charging
                </>
              ) : 'Not Charging'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">Power Consumption</span>
            <span className="font-medium">{batteryInfo.powerConsumption.toFixed(2)} W</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">Last Updated</span>
            <span className="font-medium">
              {new Date(batteryInfo.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryMetrics; 