import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  fetchProcessStatuses, 
  fetchCpuUsage, 
  fetchRamUsage 
} from '../../services/systemMetrics';
import ProcessTable from '../ProcessTable';

// Mock data for development
const MOCK_PROCESS_INFO = {
  processStatuses: Array(20).fill(0).map((_, i) => ({
    pid: 1000 + i,
    name: ['chrome', 'code', 'node', 'spotify'][Math.floor(Math.random() * 4)],
    cpuUsage: Math.random() * 10,
    memoryMB: Math.random() * 500
  })),
  cpuUsage: {
    totalCpuLoad: 45.5
  },
  ramUsage: {
    totalMemory: 16.0,
    usedMemory: 8.2,
    availableMemory: 7.8
  },
  timestamp: new Date().toISOString()
};

const ProcessMetrics = () => {
  const { deviceId } = useParams();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Get user ID from localStorage
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        // Use the service functions to fetch metrics
        const [processData, cpuData, ramData] = await Promise.all([
          fetchProcessStatuses(userId, deviceId),
          fetchCpuUsage(userId, deviceId),
          fetchRamUsage(userId, deviceId)
        ]);
        
        setMetrics({
          processStatuses: processData || [],
          cpuUsage: {
            totalCpuLoad: cpuData.totalCpuLoad || 0
          },
          ramUsage: {
            totalMemory: ramData.totalMemory || 0,
            usedMemory: ramData.usedMemory || 0,
            availableMemory: ramData.availableMemory || 0
          },
          timestamp: new Date().toISOString()
        });
        setError(null);
      } catch (error) {
        console.error('Error loading process metrics:', error);
        setError(`Failed to load process information: ${error.message}`);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);

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
          <h2 className="text-2xl font-bold mb-4">Process Monitor</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="p-4">Loading process information...</div>;
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

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Process Monitor</h2>

        {/* Process Table */}
        <div className="mb-8">
          <ProcessTable processes={metrics.processStatuses.map(p => ({
            pid: p.pid,
            name: p.name,
            cpu: p.cpuUsage,
            memory: p.memoryMB
          }))} />
        </div>

        {/* System Resource Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">System Load</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CPU Load</span>
                <span className="font-medium">{metrics.cpuUsage.totalCpuLoad.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Process Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Processes</span>
                <span className="font-medium">{metrics.processStatuses.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active</span>
                <span className="font-medium">
                  {metrics.processStatuses.filter(p => p.cpuUsage > 0.1).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Memory</span>
                <span className="font-medium">{metrics.ramUsage.totalMemory.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Used Memory</span>
                <span className="font-medium">{metrics.ramUsage.usedMemory.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available Memory</span>
                <span className="font-medium">{metrics.ramUsage.availableMemory.toFixed(1)} GB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProcessMetrics; 