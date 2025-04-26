import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSystemMetrics } from '../../services/systemMetrics';
import MetricGauge from '../MetricGauge';

const DiskMetrics = () => {
  const { deviceId } = useParams();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchSystemMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading disk metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  // Calculate disk usage in GB
  const totalGB = metrics.disk.total / 1024;
  const usedGB = metrics.disk.used / 1024;
  const availableGB = totalGB - usedGB;
  const usagePercentage = (usedGB / totalGB) * 100;

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
          <h2 className="text-2xl font-bold mt-2">Disk Usage</h2>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-8">
        {/* Main Disk Usage Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Disk Usage Gauge */}
            <div>
              <MetricGauge
                title="Disk"
                value={usagePercentage}
                color="#22C55E"
                suffix="%"
                subtitle="Storage Usage"
              />
            </div>

            {/* Disk Information Table */}
            <div className="self-center">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-gray-500">Filesystem</span>
                  <span className="font-medium">/dev/sda1</span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-gray-500">Total Size</span>
                  <span className="font-medium">{totalGB.toFixed(2)} GB</span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-gray-500">Used Space</span>
                  <span className="font-medium">{usedGB.toFixed(2)} GB</span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-gray-500">Available Space</span>
                  <span className="font-medium">{availableGB.toFixed(2)} GB</span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-gray-500">Timestamp</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disk I/O Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Disk I/O Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <MetricGauge
                title="Read Speed"
                value={(metrics.disk.read / 100) * 100}
                color="#3B82F6"
                suffix="MB/s"
                subtitle="Current Disk Read Speed"
              />
            </div>
            <div>
              <MetricGauge
                title="Write Speed"
                value={(metrics.disk.write / 100) * 100}
                color="#8B5CF6"
                suffix="MB/s"
                subtitle="Current Disk Write Speed"
              />
            </div>
          </div>
        </div>

        {/* Disk Health Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Disk Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="font-medium mt-1">45°C</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Power On Hours</p>
              <p className="font-medium mt-1">2,160</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Health Status</p>
              <p className="font-medium mt-1 text-green-600">Good</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium mt-1">SSD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiskMetrics; 