import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetricGauge from '../MetricGauge';
import LoadingScreen from '../LoadingScreen';
import { fetchRamUsage } from '../../services/systemMetrics';

// Mock data for development/testing purposes when real data isn't available
// This provides a consistent data structure for development
const MOCK_MEMORY_INFO = {
  totalMemory: 16.0,
  usedMemory: 8.2,
  availableMemory: 7.8,
  timestamp: new Date().toISOString()
};

/**
 * MemoryMetrics Component
 * 
 * Displays detailed RAM usage information for a specific device.
 * Shows total memory, used memory, and available memory.
 * Uses MetricGauge component to visualize memory usage percentage.
 * Implements error handling and loading states.
 */
const MemoryMetrics = () => {
  // Extract deviceId from URL parameters
  const { deviceId } = useParams();
  // State to store memory information
  const [memoryInfo, setMemoryInfo] = useState(null);
  // State to track and display any errors
  const [error, setError] = useState(null);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // State to track if initial data has been loaded
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Effect hook to fetch memory metrics data
  useEffect(() => {
    // Function to load memory information from the API
    const loadMemoryInfo = async () => {
      try {
        // Only show loading indicator on initial load
        if (!initialLoadComplete) {
          setLoading(true);
        }
        
        // Get user ID from localStorage (stored during login)
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        
        // Validate required parameters before making API call
        if (!userId || !deviceId) {
          console.error('Missing user ID or device ID:', { userId, deviceId });
          setError('Missing user ID or device ID. Please make sure you are logged in and have a device selected.');
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        console.log(`Fetching memory metrics for user ${userId}, device ${deviceId}`);
        
        // Use the fetchRamUsage service function to get memory data
        const data = await fetchRamUsage(userId, deviceId);
        console.log('Memory data received:', data);
        
        // Validate the returned data exists
        if (!data) {
          console.error('No memory data received');
          setError('No memory data received from server');
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        // Update state with the formatted memory data
        // Parse string values to floats with fallback to 0 if parsing fails
        setMemoryInfo({
          totalMemory: parseFloat(data.totalMemory) || 0,
          usedMemory: parseFloat(data.usedMemory) || 0,
          availableMemory: parseFloat(data.availableMemory) || 0,
          timestamp: new Date().toISOString()
        });
        
        // Clear any previous errors
        setError(null);
        
        // Set loading to false and mark initial load as complete
        setLoading(false);
        setInitialLoadComplete(true);
      } catch (error) {
        // Log error to console for debugging
        console.error('Error loading memory metrics:', error);
        // Set user-friendly error message
        setError(`Failed to load memory information: ${error.message}`);
        // Clear memory info when error occurs
        setMemoryInfo(null);
        // Set loading to false and mark initial load as complete
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    // Call the function to load data
    loadMemoryInfo();
    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(loadMemoryInfo, 5000);

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
          <h2 className="text-2xl font-bold mb-4">Memory Metrics</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Render loading state only during initial data loading
  if (loading && !initialLoadComplete) {
    return <LoadingScreen message="Loading memory metrics..." />;
  }

  // Show main content if we have memory data, or after initial load
  const displayMemoryInfo = memoryInfo || {
    totalMemory: 0,
    usedMemory: 0,
    availableMemory: 0,
    timestamp: new Date().toISOString()
  };

  // Calculate memory usage percentage with protection against division by zero
  const usedPercentage = displayMemoryInfo.totalMemory > 0 
    ? (displayMemoryInfo.usedMemory / displayMemoryInfo.totalMemory) * 100 
    : 0;

  // Main component render with memory metrics display
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

        {/* Memory Usage with Gauge - Visualizes memory usage percentage with a gauge component */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <MetricGauge
              title="Memory Usage"
              value={usedPercentage}
              color={
                usedPercentage > 90 ? '#EF4444' :  // Red for critical usage (>90%)
                usedPercentage > 70 ? '#F59E0B' :  // Yellow for warning (>70%)
                '#3B82F6'  // Blue for normal usage
              }
              suffix="%"
              subtitle={`${displayMemoryInfo.usedMemory.toFixed(1)}/${displayMemoryInfo.totalMemory.toFixed(1)} GB`}
            />
          </div>
        </div>

        {/* Memory Details - Shows detailed memory usage information in a grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-gray-500 mb-2">Total Memory</h4>
            <div className="text-2xl font-semibold">{displayMemoryInfo.totalMemory.toFixed(1)} GB</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-gray-500 mb-2">Used Memory</h4>
            <div className="text-2xl font-semibold">{displayMemoryInfo.usedMemory.toFixed(1)} GB</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-gray-500 mb-2">Available Memory</h4>
            <div className="text-2xl font-semibold">{displayMemoryInfo.availableMemory.toFixed(1)} GB</div>
          </div>
        </div>

        {/* Timestamp showing when the data was last updated */}
        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(displayMemoryInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MemoryMetrics; 