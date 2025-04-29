import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetricGauge from '../MetricGauge';
import { fetchDiskUsage, fetchDiskIO } from '../../services/systemMetrics';

// Mock data for development
const MOCK_DISK_INFO = {
  usage: {
    filesystem: '/dev/sda1',
    sizeGB: 512.0,
    usedGB: 200.0,
    availableGB: 312.0
  },
  io: {
    readSpeedMBps: 120.5,
    writeSpeedMBps: 80.3
  },
  timestamp: new Date().toISOString()
};

const DiskMetrics = () => {
  const { deviceId } = useParams();
  const [diskInfo, setDiskInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDiskInfo = async () => {
      try {
        // Get user ID from localStorage
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        // Use the service functions to fetch disk metrics
        const [usageData, ioData] = await Promise.all([
          fetchDiskUsage(userId, deviceId),
          fetchDiskIO(userId, deviceId)
        ]);

        setDiskInfo({
          usage: {
            filesystem: usageData.filesystem,
            sizeGB: usageData.sizeGB,
            usedGB: usageData.usedGB,
            availableGB: usageData.availableGB
          },
          io: {
            readSpeedMBps: ioData.readSpeedMBps,
            writeSpeedMBps: ioData.writeSpeedMBps
          },
          timestamp: new Date().toISOString()
        });
        setError(null);
      } catch (error) {
        console.error('Error loading disk metrics:', error);
        setError(`Failed to load disk information: ${error.message}`);
        setDiskInfo(null);
      }
    };

    loadDiskInfo();
    const interval = setInterval(loadDiskInfo, 5000);

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
          <h2 className="text-2xl font-bold mb-4">Disk Metrics</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!diskInfo) {
    return <div className="p-4">Loading disk information...</div>;
  }

  const usedPercentage = (diskInfo.usage.usedGB / diskInfo.usage.sizeGB) * 100;

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
        <h2 className="text-2xl font-bold mb-8">Disk Metrics</h2>

        {/* Disk Usage with Gauge */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <MetricGauge
              title="Disk Usage"
              value={usedPercentage}
              color={
                usedPercentage > 90 ? '#EF4444' :  // red-500
                usedPercentage > 70 ? '#F59E0B' :  // yellow-500
                '#22C55E'  // green-500
              }
              suffix="%"
              subtitle={`${diskInfo.usage.usedGB.toFixed(1)}/${diskInfo.usage.sizeGB.toFixed(1)} GB`}
            />
          </div>
        </div>

        {/* Disk Usage Section */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Disk Usage</h3>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Filesystem: {diskInfo.usage.filesystem}</div>
            <div className="bg-gray-100 rounded-full p-1">
              <div 
                className={`text-white text-center py-2 px-4 rounded-full transition-all duration-500 ease-in-out ${
                  usedPercentage > 90 ? 'bg-red-500' : 
                  usedPercentage > 70 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${usedPercentage}%` }}
              >
                {usedPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-500 mb-2">Total Size</h4>
              <div className="text-2xl font-semibold">{diskInfo.usage.sizeGB.toFixed(1)} GB</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-500 mb-2">Used Space</h4>
              <div className="text-2xl font-semibold">{diskInfo.usage.usedGB.toFixed(1)} GB</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-500 mb-2">Available Space</h4>
              <div className="text-2xl font-semibold">{diskInfo.usage.availableGB.toFixed(1)} GB</div>
            </div>
          </div>
        </div>

        {/* Disk I/O Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Disk I/O</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-500 mb-2">Read Speed</h4>
              <div className="text-2xl font-semibold">{diskInfo.io.readSpeedMBps.toFixed(1)} MB/s</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-500 mb-2">Write Speed</h4>
              <div className="text-2xl font-semibold">{diskInfo.io.writeSpeedMBps.toFixed(1)} MB/s</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(diskInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default DiskMetrics; 