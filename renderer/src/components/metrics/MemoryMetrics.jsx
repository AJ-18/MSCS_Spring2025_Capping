import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetricGauge from '../MetricGauge';
import { fetchRamUsage } from '../../services/systemMetrics';

// Mock data for development
const MOCK_MEMORY_INFO = {
  totalMemory: 16.0,
  usedMemory: 8.2,
  availableMemory: 7.8,
  timestamp: new Date().toISOString()
};

const MemoryMetrics = () => {
  const { deviceId } = useParams();
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemoryInfo = async () => {
      try {
        setLoading(true);
        // Get user ID from localStorage
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        if (!userId || !deviceId) {
          console.error('Missing user ID or device ID:', { userId, deviceId });
          setError('Missing user ID or device ID. Please make sure you are logged in and have a device selected.');
          setLoading(false);
          return;
        }
        
        console.log(`Fetching memory metrics for user ${userId}, device ${deviceId}`);
        
        // Use the fetchRamUsage service function
        const data = await fetchRamUsage(userId, deviceId);
        console.log('Memory data received:', data);
        
        if (!data) {
          console.error('No memory data received');
          setError('No memory data received from server');
          setLoading(false);
          return;
        }
        
        setMemoryInfo({
          totalMemory: parseFloat(data.totalMemory) || 0,
          usedMemory: parseFloat(data.usedMemory) || 0,
          availableMemory: parseFloat(data.availableMemory) || 0,
          timestamp: new Date().toISOString()
        });
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error('Error loading memory metrics:', error);
        setError(`Failed to load memory information: ${error.message}`);
        setMemoryInfo(null);
        setLoading(false);
      }
    };

    loadMemoryInfo();
    const interval = setInterval(loadMemoryInfo, 5000);

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
          <h2 className="text-2xl font-bold mb-4">Memory Metrics</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (loading || !memoryInfo) {
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
        <div className="p-4">Loading memory information...</div>
      </div>
    );
  }

  // Calculate memory usage percentage
  const usedPercentage = memoryInfo.totalMemory > 0 
    ? (memoryInfo.usedMemory / memoryInfo.totalMemory) * 100 
    : 0;

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

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Memory Metrics</h2>

        {/* Memory Usage with Gauge */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <MetricGauge
              title="Memory Usage"
              value={usedPercentage}
              color={
                usedPercentage > 90 ? '#EF4444' :  // red-500
                usedPercentage > 70 ? '#F59E0B' :  // yellow-500
                '#3B82F6'  // blue-500
              }
              suffix="%"
              subtitle={`${memoryInfo.usedMemory.toFixed(1)}/${memoryInfo.totalMemory.toFixed(1)} GB`}
            />
          </div>
        </div>

        {/* Memory Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-gray-500 mb-2">Total Memory</h4>
            <div className="text-2xl font-semibold">{memoryInfo.totalMemory.toFixed(1)} GB</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-gray-500 mb-2">Used Memory</h4>
            <div className="text-2xl font-semibold">{memoryInfo.usedMemory.toFixed(1)} GB</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-gray-500 mb-2">Available Memory</h4>
            <div className="text-2xl font-semibold">{memoryInfo.availableMemory.toFixed(1)} GB</div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(memoryInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MemoryMetrics; 