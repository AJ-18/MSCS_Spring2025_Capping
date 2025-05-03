import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetricGauge from '../MetricGauge';
import { fetchCpuUsage } from '../../services/systemMetrics';

// Mock data for development/testing purposes when real data isn't available
// This provides a consistent data structure for development
const MOCK_CPU_INFO = {
  totalCpuLoad: 55.5,
  perCoreUsageJson: JSON.stringify([
    { core: 1, usage: 60.5 },
    { core: 2, usage: 45.2 },
    { core: 3, usage: 52.8 },
    { core: 4, usage: 48.7 },
    { core: 5, usage: 55.3 },
    { core: 6, usage: 42.1 },
    { core: 7, usage: 58.9 },
    { core: 8, usage: 51.4 }
  ]),
  timestamp: new Date().toISOString()
};

/**
 * CpuMetrics Component
 * 
 * Displays detailed CPU usage metrics for a specific device.
 * Shows overall CPU load and individual core usage percentages.
 * Uses MetricGauge component to visualize the total CPU load.
 * Implements error handling and loading states.
 */
const CpuMetrics = () => {
  // Extract deviceId from URL parameters
  const { deviceId } = useParams();
  // State to store CPU information
  const [cpuInfo, setCpuInfo] = useState(null);
  // State to track and display any errors
  const [error, setError] = useState(null);
  // State to track loading status
  const [loading, setLoading] = useState(true);

  // Effect hook to fetch CPU metrics data
  useEffect(() => {
    // Function to load CPU information from the API
    const loadCpuInfo = async () => {
      try {
        setLoading(true);
        // Get user ID from localStorage (stored during login)
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        // Validate required parameters before making API call
        if (!userId || !deviceId) {
          console.error('Missing user ID or device ID:', { userId, deviceId });
          setError('Missing user ID or device ID. Please make sure you are logged in and have a device selected.');
          setLoading(false);
          return;
        }
        
        console.log(`Fetching CPU metrics for user ${userId}, device ${deviceId}`);
        
        // Use the fetchCpuUsage service function to get CPU data
        const data = await fetchCpuUsage(userId, deviceId);
        console.log('CPU data received:', data);
        
        // Validate the returned data has the expected format
        if (!data || typeof data.totalCpuLoad !== 'number') {
          console.error('Invalid CPU data received:', data);
          setError('Received invalid CPU data from server');
          setLoading(false);
          return;
        }

        // Parse and validate the per-core usage data
        let perCoreUsage = [];
        try {
          // Try to parse the per-core usage data
          perCoreUsage = data.perCoreUsageJson ? JSON.parse(data.perCoreUsageJson) : [];
          
          // Validate the per-core data structure
          if (!Array.isArray(perCoreUsage)) {
            console.warn('Per-core usage is not an array, resetting to empty array');
            perCoreUsage = [];
          }
        } catch (parseError) {
          console.error('Error parsing per-core usage JSON:', parseError);
          perCoreUsage = [];
        }
        
        // Update state with the formatted CPU data
        setCpuInfo({
          totalCpuLoad: data.totalCpuLoad,
          perCoreUsage: perCoreUsage,
          timestamp: new Date().toISOString()
        });
        // Clear any previous errors
        setError(null);
        // Set loading to false as data is now available
        setLoading(false);
      } catch (error) {
        // Log error to console for debugging
        console.error('Error loading CPU metrics:', error);
        // Set user-friendly error message
        setError(`Failed to load CPU information: ${error.message}`);
        // Clear CPU info when error occurs
        setCpuInfo(null);
        // Set loading to false as the operation has completed (with error)
        setLoading(false);
      }
    };

    // Call the function to load data
    loadCpuInfo();
    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(loadCpuInfo, 5000);

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
          <h2 className="text-2xl font-bold mb-4">CPU Metrics</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Render loading state while fetching data
  if (loading || !cpuInfo) {
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
        <div className="p-4">Loading CPU information...</div>
      </div>
    );
  }

  // Main component render with CPU metrics display
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
        <h2 className="text-2xl font-bold mb-8">CPU Metrics</h2>

        {/* Total CPU Load with Gauge - Visualizes overall CPU usage with a gauge component */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <MetricGauge
              title="Total CPU Load"
              value={cpuInfo.totalCpuLoad || 0}
              color={
                cpuInfo.totalCpuLoad > 90 ? '#EF4444' :  // Red for critical usage (>90%)
                cpuInfo.totalCpuLoad > 70 ? '#F59E0B' :  // Yellow for warning (>70%)
                '#10B981'  // Green for normal usage
              }
              suffix="%"
            />
          </div>
        </div>

        {/* Per Core Usage - Displays individual CPU core usage percentages */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Per Core Usage</h3>
          {/* Conditional rendering based on whether per-core data is available */}
          {cpuInfo.perCoreUsage && cpuInfo.perCoreUsage.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Map through each core and display its usage */}
              {cpuInfo.perCoreUsage.map((core) => (
                <div key={core.core} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Core {core.core}</span>
                    <span className="font-medium">{typeof core.usage === 'number' ? core.usage.toFixed(1) : '0.0'}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                        core.usage > 90 ? 'bg-red-500' : 
                        core.usage > 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${core.usage || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Display message when no per-core data is available
            <div className="text-gray-500 text-center py-4">
              No per-core data available
            </div>
          )}
        </div>

        {/* Timestamp showing when the data was last updated */}
        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(cpuInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CpuMetrics; 