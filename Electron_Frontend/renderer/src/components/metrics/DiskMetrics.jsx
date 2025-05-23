import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetricGauge from '../MetricGauge';
import LoadingScreen from '../LoadingScreen';
import { fetchDiskUsage, fetchDiskIO } from '../../services/systemMetrics';

// Mock data for development/testing purposes when real data isn't available
// This provides a consistent data structure for development
const MOCK_DISK_INFO = {
  usage: [
    {
      filesystem: '/dev/sda1',
      sizeGB: 512.0,
      usedGB: 200.0,
      availableGB: 312.0
    }
  ],
  io: {
    readSpeedMBps: 120.5,
    writeSpeedMBps: 80.3
  },
  timestamp: new Date().toISOString()
};

/**
 * DiskMetrics Component
 * 
 * Displays detailed disk usage and I/O metrics for a specific device.
 * Shows disk capacity, used space, available space, and read/write speeds.
 * Uses a gauge for total usage and progress bars for individual drives.
 */
const DiskMetrics = () => {
  // Extract deviceId from URL parameters
  const { deviceId } = useParams();
  // State to store disk information
  const [diskInfo, setDiskInfo] = useState(null);
  // State to track and display any errors
  const [error, setError] = useState(null);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // State to track if initial data has been loaded
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Effect hook to fetch disk metrics data
  useEffect(() => {
    // Function to load disk information from the API
    const loadDiskInfo = async () => {
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
        
        // Fetch both disk usage and I/O metrics in parallel using Promise.all
        const [usageData, ioData] = await Promise.all([
          fetchDiskUsage(userId, deviceId),
          fetchDiskIO(userId, deviceId)
        ]);

        // Structure the response data into a consistent format
        // Handle usageData as array (new format) or convert single object to array (old format)
        const diskUsageArray = Array.isArray(usageData) ? usageData : [usageData];

        setDiskInfo({
          usage: diskUsageArray,
          io: {
            readSpeedMBps: ioData.readSpeedMBps,
            writeSpeedMBps: ioData.writeSpeedMBps
          },
          timestamp: new Date().toISOString()
        });
        
        // Clear any previous errors
        setError(null);
        
        // Set loading to false and mark initial load as complete
        setLoading(false);
        setInitialLoadComplete(true);
      } catch (error) {
        // Log error to console for debugging
        console.error('Error loading disk metrics:', error);
        // Set user-friendly error message
        setError(`Failed to load disk information: ${error.message}`);
        // Clear disk info when error occurs
        setDiskInfo(null);
        // Set loading to false and mark initial load as complete
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    // Call the function to load data
    loadDiskInfo();
    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(loadDiskInfo, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [deviceId, initialLoadComplete]); // Re-run effect when deviceId changes or initialLoadComplete changes

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
          <h2 className="text-2xl font-bold mb-4">Disk Metrics</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Render loading state only during initial data loading
  if (loading && !initialLoadComplete) {
    return <LoadingScreen message="Loading disk metrics..." />;
  }

  // Show main content if we have disk data, or after initial load
  const displayDiskInfo = diskInfo || {
    usage: [{
      filesystem: '',
      sizeGB: 0,
      usedGB: 0,
      availableGB: 0
    }],
    io: {
      readSpeedMBps: 0,
      writeSpeedMBps: 0
    },
    timestamp: new Date().toISOString()
  };

  // Get total disk usage across all drives for the summary
  const totalSizeGB = displayDiskInfo.usage.reduce((sum, disk) => sum + disk.sizeGB, 0);
  const totalUsedGB = displayDiskInfo.usage.reduce((sum, disk) => sum + disk.usedGB, 0);
  const totalUsedPercentage = totalSizeGB > 0 ? (totalUsedGB / totalSizeGB) * 100 : 0;

  // Determine gauge color based on total usage percentage
  const getGaugeColor = (percentage) => {
    if (percentage > 90) return '#EF4444'; // Red for critical usage
    if (percentage > 70) return '#F59E0B'; // Yellow/amber for warning
    return '#22C55E'; // Green for normal usage
  };

  // Main component render with disk metrics display
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

        {/* Total Disk Usage with Gauge Visualization */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Total Disk Usage</h3>
          <div className="flex justify-center">
            <MetricGauge
              title="Total Usage"
              value={totalUsedPercentage}
              color={getGaugeColor(totalUsedPercentage)}
              suffix="%"
              subtitle={`${totalUsedGB.toFixed(1)}/${totalSizeGB.toFixed(1)} GB`}
            />
          </div>
        </div>

        {/* Individual Disk Usage Sections - Shows detailed disk space information for each drive */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Disk Usage by Drive</h3>
          
          {displayDiskInfo.usage.map((disk, index) => {
            const usedPercentage = (disk.usedGB / disk.sizeGB) * 100 || 0;
            
            return (
              <div key={index} className="mb-8 border-b pb-6 last:border-b-0 last:pb-0">
                <div className="mb-2 font-semibold">Drive: {disk.filesystem}</div>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{usedPercentage.toFixed(1)}%</span>
                    <span className="text-gray-500 text-sm">{disk.usedGB.toFixed(1)}/{disk.sizeGB.toFixed(1)} GB</span>
                  </div>
                  <div className="bg-gray-100 rounded-full p-1">
                    <div 
                      className={`text-white text-center py-2 px-4 rounded-full transition-all duration-500 ease-in-out ${
                        usedPercentage > 90 ? 'bg-red-500' : 
                        usedPercentage > 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.max(5, usedPercentage)}%` }}
                    >
                      {usedPercentage > 10 ? `${usedPercentage.toFixed(1)}%` : ''}
                    </div>
                  </div>
                </div>

                {/* Detailed metrics for each disk */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-gray-500 mb-2">Total Size</h4>
                    <div className="text-2xl font-semibold">{disk.sizeGB.toFixed(1)} GB</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-gray-500 mb-2">Used Space</h4>
                    <div className="text-2xl font-semibold">{disk.usedGB.toFixed(1)} GB</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-gray-500 mb-2">Available Space</h4>
                    <div className="text-2xl font-semibold">{disk.availableGB.toFixed(1)} GB</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disk I/O Section - Shows read and write speeds */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Disk I/O</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-500 mb-2">Read Speed</h4>
              <div className="text-2xl font-semibold">{displayDiskInfo.io.readSpeedMBps.toFixed(1)} MB/s</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-500 mb-2">Write Speed</h4>
              <div className="text-2xl font-semibold">{displayDiskInfo.io.writeSpeedMBps.toFixed(1)} MB/s</div>
            </div>
          </div>
        </div>

        {/* Timestamp showing when the data was last updated */}
        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(displayDiskInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default DiskMetrics; 