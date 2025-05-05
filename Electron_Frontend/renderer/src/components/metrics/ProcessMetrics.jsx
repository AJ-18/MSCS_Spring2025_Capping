import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProcessTable from '../ProcessTable';
import LoadingScreen from '../LoadingScreen';
import { 
  fetchProcessStatuses, 
  fetchCpuUsage, 
  fetchRamUsage 
} from '../../services/systemMetrics';

/**
 * ProcessMetrics Component
 * 
 * Displays detailed process information for a specific device.
 * Shows a table of active processes with their resource usage.
 * Also includes system CPU and memory usage summaries.
 * Implements error handling and loading states.
 */
const ProcessMetrics = () => {
  // Extract deviceId from URL parameters
  const { deviceId } = useParams();
  // State to store metrics data
  const [metrics, setMetrics] = useState({
    processStatuses: [],
    cpuUsage: { totalCpuLoad: 0 },
    ramUsage: { totalMemory: 0, usedMemory: 0, availableMemory: 0 },
    timestamp: new Date().toISOString()
  });
  // State to track and display any errors
  const [error, setError] = useState(null);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // State to track if initial data has been loaded
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Effect hook to fetch process and system metrics data
  useEffect(() => {
    // Function to load all metrics from the API
    const loadMetrics = async () => {
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
        
        // Fetch multiple metrics in parallel using Promise.all for efficiency
        const [processData, cpuData, ramData] = await Promise.all([
          fetchProcessStatuses(userId, deviceId),
          fetchCpuUsage(userId, deviceId),
          fetchRamUsage(userId, deviceId)
        ]);
        
        // Enhanced diagnostic logging for process data
        console.log(`Received ${processData ? processData.length : 0} processes from API`);
        if (processData && processData.length > 0) {
          // Track Opera memory over time to detect accumulation issues
          const operaProcess = processData.find(p => p.name === 'opera.exe');
          if (operaProcess) {
            console.log(`FRONTEND - Opera memory: ${operaProcess.memoryMB} MB`);
          }
          
          // Log stats for known processes to compare with Task Manager
          const knownProcesses = ['opera.exe', 'chrome.exe', 'discord.exe', 'cursor.exe'];
          knownProcesses.forEach(name => {
            const procs = processData.filter(p => p.name && p.name.toLowerCase() === name.toLowerCase());
            if (procs.length > 0) {
              console.log(`Task Manager Comparison - ${name}:`);
              procs.forEach(p => {
                console.log(`  Raw values - CPU: ${p.cpuUsage}%, Memory: ${p.memoryMB} MB`);
              });
            }
          });
          
          // Log the top 5 processes by memory usage
          console.log('Top 5 processes by memory usage:');
          const sortedByMem = [...processData].sort((a, b) => 
            (typeof b.memoryMB === 'number' ? b.memoryMB : 0) - 
            (typeof a.memoryMB === 'number' ? a.memoryMB : 0)
          ).slice(0, 5);
          sortedByMem.forEach(p => {
            console.log(`${p.name}: ${p.memoryMB} MB`);
          });
        }
        
        console.log('Process data sample:', processData ? processData.slice(0, 3) : 'No data');
        console.log('Processes with non-zero CPU:', processData ? processData.filter(p => p.cpuUsage > 0).length : 0);
        console.log('Processes with zero CPU:', processData ? processData.filter(p => p.cpuUsage === 0).length : 0);
        console.log('CPU usage range:', 
          processData ? 
          {
            min: Math.min(...processData.map(p => p.cpuUsage)),
            max: Math.max(...processData.map(p => p.cpuUsage)),
            avg: processData.reduce((sum, p) => sum + p.cpuUsage, 0) / processData.length
          } : 'No data');
        console.log('Process names:', processData ? [...new Set(processData.map(p => p.name))].join(', ') : 'No data');
        
        // Combine all metrics into a single state object with defaults for missing data
        setMetrics({
          processStatuses: processData || [],
          cpuUsage: {
            totalCpuLoad: cpuData.totalCpuLoad || 0,
            logicalCoreCount: cpuData.logicalCoreCount || 8 // Store core count for calculations
          },
          ramUsage: {
            totalMemory: ramData.totalMemory || 0,
            usedMemory: ramData.usedMemory || 0,
            availableMemory: ramData.availableMemory || 0
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
        console.error('Error loading process metrics:', error);
        // Set user-friendly error message
        setError(`Failed to load process information: ${error.message}`);
        // Set loading to false and mark initial load as complete
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    // Call the function to load data
    loadMetrics();
    // Set up interval to refresh data every 5 seconds (was previously 5000ms)
    // This matches the backend polling interval for more consistent updates
    const interval = setInterval(loadMetrics, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [deviceId, initialLoadComplete]); // Re-run effect when deviceId changes

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
          <h2 className="text-2xl font-bold mb-4">Process Information</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Render loading state only during initial data loading
  if (loading && !initialLoadComplete) {
    return <LoadingScreen message="Loading process metrics..." />;
  }

  // Main component render with process metrics display
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

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Process Information</h2>

        {/* Process Table - Displays a list of running processes with resource usage */}
        <div className="mb-8">
          <ProcessTable processes={metrics.processStatuses.map(p => ({
            pid: p.pid,
            name: p.name,
            // Simply pass the CPU value directly as it's now properly calibrated in the backend
            cpu: typeof p.cpuUsage === 'number' ? p.cpuUsage : 0,
            // Pass memory directly - the ProcessTable component will handle formatting
            memory: typeof p.memoryMB === 'number' ? p.memoryMB : 0,
            // Pass logical core count for proper CPU calculations
            logicalCoreCount: metrics.cpuUsage.logicalCoreCount || 8
          }))} />
        </div>

        {/* System Resource Summary - Shows overall CPU and memory stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Load Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">System Load</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CPU Load</span>
                <span className="font-medium">{metrics.cpuUsage.totalCpuLoad.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Process Count Statistics */}
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

          {/* Memory Usage Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Used</span>
                <span className="font-medium">{metrics.ramUsage.usedMemory.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available</span>
                <span className="font-medium">{metrics.ramUsage.availableMemory.toFixed(1)} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamp showing when the data was last updated */}
        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProcessMetrics; 