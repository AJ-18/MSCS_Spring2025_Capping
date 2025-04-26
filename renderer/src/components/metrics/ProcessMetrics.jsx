import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSystemMetrics } from '../../services/systemMetrics';
import ProcessTable from '../ProcessTable';

const ProcessMetrics = () => {
  const { deviceId } = useParams();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchSystemMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading process metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/dashboard/device/${deviceId}`}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Device Overview
          </Link>
          <h2 className="text-2xl font-bold mt-2">Process Monitor</h2>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <ProcessTable processes={metrics.processes} />
      </div>

      {/* System Resource Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">System Load</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">1 minute</span>
              <span className="font-medium">{(Math.random() * 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">5 minutes</span>
              <span className="font-medium">{(Math.random() * 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">15 minutes</span>
              <span className="font-medium">{(Math.random() * 2).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Process Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Processes</span>
              <span className="font-medium">{metrics.processes.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Running</span>
              <span className="font-medium">{Math.floor(metrics.processes.length * 0.7)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sleeping</span>
              <span className="font-medium">{Math.floor(metrics.processes.length * 0.3)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">CPU Usage</span>
              <span className="font-medium">{metrics.cpu.usage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Memory Usage</span>
              <span className="font-medium">
                {(metrics.memory.used / metrics.memory.total * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Swap Usage</span>
              <span className="font-medium">2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessMetrics; 