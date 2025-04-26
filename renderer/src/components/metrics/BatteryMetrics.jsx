import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSystemMetrics } from '../../services/systemMetrics';

const BatteryMetrics = () => {
  const { deviceId } = useParams();
  const [batteryInfo, setBatteryInfo] = useState(null);

  useEffect(() => {
    const loadBatteryInfo = async () => {
      try {
        const data = await fetchSystemMetrics();
        setBatteryInfo({
          percentage: data.battery?.percentage || 80,
          isCharging: data.battery?.isCharging || false,
          powerConsumption: data.battery?.powerConsumption || 12.50,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error loading battery metrics:', error);
      }
    };

    loadBatteryInfo();
    const interval = setInterval(loadBatteryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!batteryInfo) {
    return <div className="p-4">Loading battery information...</div>;
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
              className="bg-green-500 text-white text-center py-2 px-4 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${batteryInfo.percentage}%` }}
            >
              {batteryInfo.percentage}%
            </div>
          </div>
        </div>

        {/* Battery Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">Charging</span>
            <span className="font-medium">{batteryInfo.isCharging ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">Power Consumption</span>
            <span className="font-medium">{batteryInfo.powerConsumption.toFixed(2)} W</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">Timestamp</span>
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