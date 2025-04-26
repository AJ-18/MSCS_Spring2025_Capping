import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

// Mock data for development
const MOCK_BATTERY_INFO = {
  hasBattery: true,
  batteryPercentage: 80,
  isCharging: false,
  powerConsumption: 12.50,
  timestamp: new Date().toISOString()
};

const BatteryMetrics = () => {
  const { deviceId } = useParams();
  const [batteryInfo, setBatteryInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBatteryInfo = async () => {
      try {
        // In development mode, use mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock battery metrics in development mode');
          setBatteryInfo({
            ...MOCK_BATTERY_INFO,
            timestamp: new Date().toISOString() // Update timestamp
          });
          setError(null);
          return;
        }

        // Production mode - real API call
        const userId = localStorage.getItem('userId');
        if (!userId || !deviceId) {
          throw new Error('Missing user ID or device ID');
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/metrics/battery-info/${userId}/${deviceId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const data = await response.json();
        setBatteryInfo({
          hasBattery: data.hasBattery ?? true,
          percentage: data.batteryPercentage ?? 80,
          isCharging: data.isCharging ?? false,
          powerConsumption: data.powerConsumption ?? 12.50,
          timestamp: new Date().toISOString()
        });
        setError(null);
      } catch (error) {
        console.error('Error loading battery metrics:', error);
        if (process.env.NODE_ENV === 'development') {
          // In development, fall back to mock data on error
          console.log('Falling back to mock data due to error');
          setBatteryInfo({
            ...MOCK_BATTERY_INFO,
            timestamp: new Date().toISOString()
          });
          setError(null);
        } else {
          setError(`Failed to load battery information: ${error.message}`);
          setBatteryInfo(null);
        }
      }
    };

    loadBatteryInfo();
    const interval = setInterval(loadBatteryInfo, 5000);

    return () => clearInterval(interval);
  }, [deviceId]);

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

  if (!batteryInfo) {
    return <div className="p-4">Loading battery information...</div>;
  }

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

        {/* Battery Percentage Bar */}
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

        {/* Battery Details */}
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