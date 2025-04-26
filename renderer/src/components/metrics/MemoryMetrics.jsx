import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSystemMetrics } from '../../services/systemMetrics';
import MetricGauge from '../MetricGauge';

const MemoryMetrics = () => {
  const { deviceId } = useParams();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchSystemMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading memory metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  // Calculate memory percentages
  const totalGB = metrics.memory.total / 1024;
  const usedGB = metrics.memory.used / 1024;
  const freeGB = metrics.memory.free / 1024;
  const cachedGB = metrics.memory.cached / 1024;
  const usedPercentage = (usedGB / totalGB) * 100;
  const cachedPercentage = (cachedGB / totalGB) * 100;

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
          <h2 className="text-2xl font-bold mt-2">Memory Usage</h2>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Memory Usage */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <MetricGauge
            title="Memory Usage"
            value={usedPercentage}
            color="#10B981"
            suffix="%"
            subtitle={`${usedGB.toFixed(1)}GB used of ${totalGB.toFixed(1)}GB`}
          />
        </div>

        {/* Cached Memory */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <MetricGauge
            title="Cached Memory"
            value={cachedPercentage}
            color="#8B5CF6"
            suffix="%"
            subtitle={`${cachedGB.toFixed(1)}GB cached`}
          />
        </div>

        {/* Memory Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Memory Distribution</h3>
          <div className="space-y-6">
            {/* Used Memory Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Used Memory</span>
                <span>{usedGB.toFixed(1)}GB</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>
            </div>

            {/* Cached Memory Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Cached Memory</span>
                <span>{cachedGB.toFixed(1)}GB</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${cachedPercentage}%` }}
                />
              </div>
            </div>

            {/* Free Memory Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Free Memory</span>
                <span>{freeGB.toFixed(1)}GB</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(freeGB / totalGB) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Memory Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Memory Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Memory</p>
              <p className="font-medium mt-1">{totalGB.toFixed(1)}GB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Available Memory</p>
              <p className="font-medium mt-1">{freeGB.toFixed(1)}GB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Memory Type</p>
              <p className="font-medium mt-1">DDR4</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Memory Speed</p>
              <p className="font-medium mt-1">3200MHz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryMetrics; 