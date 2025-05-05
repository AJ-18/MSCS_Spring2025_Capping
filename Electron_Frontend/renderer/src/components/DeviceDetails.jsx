import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DeviceInfoCard from './DeviceInfoCard';
import LoadingScreen from './LoadingScreen';
import { 
  fetchSystemMetrics, 
  fetchBatteryInfo, 
  fetchCpuUsage, 
  fetchRamUsage, 
  fetchDiskUsage, 
  fetchProcessStatuses,
  fetchDeviceSpecifications
} from '../services/systemMetrics';

/**
 * MetricCard Component
 * 
 * Reusable component to display a single metric with a consistent UI
 * Shows a title, icon, value, and unit with hover effects for interaction
 * Used for CPU, memory, disk, battery, and process metrics
 */
const MetricCard = ({ title, icon, value, unit, onClick, color }) => {
  // Define gradient colors based on the color prop
  const gradients = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    teal: 'from-teal-500 to-teal-600',
    default: 'from-indigo-500 to-blue-600'
  };

  const gradient = gradients[color] || gradients.default;
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b ${gradient}`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-700 font-medium">{title}</h3>
        <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline">
        <span className="text-4xl font-bold text-gray-800">{value}</span>
        <span className="text-gray-500 text-sm ml-1">{unit}</span>
      </div>
      
      <div className="mt-4 flex items-center text-gray-500 text-xs">
        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Real-time updates
      </div>
    </div>
  );
};

/**
 * DeviceDetails Component
 * 
 * Main component for displaying detailed information about a specific device
 * Shows device specifications and system metrics (CPU, memory, disk, battery, processes)
 * Handles data fetching, error states, and loading states
 * Provides navigation to more detailed metric-specific views
 */
const DeviceDetails = () => {
  // Get device ID from URL parameters
  const { deviceId } = useParams();
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  // State for device specifications and hardware info
  const [deviceInfo, setDeviceInfo] = useState(null);
  // State for system metrics with default values
  const [metrics, setMetrics] = useState({
    cpu: { usage: 0 },
    memory: { total: 0, used: 0, free: 0 },
    disk: { total: 0, used: 0, free: 0 },
    battery: { percentage: 0, charging: false },
    processes: []
  });
  // Loading state for UI indicators
  const [loading, setLoading] = useState(true);
  // Error state for handling and displaying errors
  const [error, setError] = useState(null);

  // Effect hook to load device specifications
  useEffect(() => {
    // Function to load device information from the API
    const loadDeviceInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user ID from localStorage (stored during login)
        const user = localStorage.getItem('user');
        if (!user) {
          setError("User information not found. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Parse user data with error handling
        let userId;
        try {
          userId = JSON.parse(user).id;
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setError("Invalid user data. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Validate required parameters before making API calls
        if (!userId || !deviceId) {
          console.error('Missing user ID or device ID for device info', { userId, deviceId });
          setError(`Missing ${!userId ? 'user ID' : 'device ID'}. Please make sure you are logged in and have selected a device.`);
          setLoading(false);
          return;
        }
        
        console.log(`Loading device info for user ${userId}, device ${deviceId}`);
        
        let deviceData = null;
        
        // Try to get device specifications from API first
        try {
          deviceData = await fetchDeviceSpecifications(userId, deviceId);
          console.log('Device specifications from API:', deviceData);
        } catch (apiError) {
          console.error('Error fetching device specs from API:', apiError);
        }
        
        // If API fails or returns no data, try to use window.metrics directly
        if (!deviceData && window.metrics && window.metrics.getDeviceInfo) {
          try {
            console.log('Attempting to get device info directly from metrics module');
            deviceData = await window.metrics.getDeviceInfo();
            console.log('Device specifications from metrics module:', deviceData);
          } catch (metricsError) {
            console.error('Error getting device info from metrics module:', metricsError);
          }
        }
        
        // If we still don't have data, check if we have real system data available
        if (!deviceData && window.metrics && window.metrics.collectDeviceInfo) {
          try {
            console.log('Attempting to collect device info directly');
            deviceData = await window.metrics.collectDeviceInfo();
            console.log('Device specifications collected directly:', deviceData);
          } catch (collectError) {
            console.error('Error collecting device info directly:', collectError);
          }
        }
        
        // If we still don't have data, use a minimal fallback with browser data
        if (!deviceData) {
          console.warn('No device data available, using fallback data');
          deviceData = {
            deviceName: 'Your Computer',
            manufacturer: navigator.platform || 'Unknown',
            model: navigator.userAgent.split(') ').pop() || 'Unknown',
            processor: navigator.hardwareConcurrency ? `CPU with ${navigator.hardwareConcurrency} cores` : 'Unknown',
            cpuPhysicalCores: navigator.hardwareConcurrency || 1,
            cpuLogicalCores: navigator.hardwareConcurrency || 1,
            installedRam: 0,
            graphics: 'Unknown',
            operatingSystem: navigator.platform || 'Unknown',
            systemType: navigator.userAgent.includes('64') ? '64-bit' : '32-bit'
          };
        }
        
        // Parse RAM value as number and format it to 1 decimal place
        let ramValue = 0;
        if (typeof deviceData.installedRam === 'number') {
          ramValue = deviceData.installedRam;
        } else if (typeof deviceData.installedRam === 'string') {
          ramValue = parseFloat(deviceData.installedRam) || 0;
        }
        
        // Format and store device information in state
        setDeviceInfo({
          deviceName: deviceData.deviceName || 'Unknown Device',
          manufacturer: deviceData.manufacturer || 'Unknown Manufacturer',
          model: deviceData.model || 'Unknown Model',
          processor: deviceData.processor || 'Unknown Processor',
          physicalCores: deviceData.cpuPhysicalCores || 0,
          logicalCores: deviceData.cpuLogicalCores || 0,
          ram: ramValue.toFixed(1),
          graphics: deviceData.graphics || 'Unknown Graphics',
          os: deviceData.operatingSystem || 'Unknown OS',
          systemType: deviceData.systemType || 'Unknown Architecture',
          timestamp: new Date().toISOString()
        });
        
        setLoading(false);
      } catch (error) {
        // Handle any unexpected errors
        console.error('Error loading device info:', error);
        setError(`Failed to load device information: ${error.message}`);
        setLoading(false);
      }
    };

    // Call the function to load device info
    loadDeviceInfo();
    // Set up interval to refresh device info every 30 seconds
    const interval = setInterval(loadDeviceInfo, 30000); // Update every 30 seconds

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [deviceId]); // Re-run effect when deviceId changes

  // Effect hook to load system metrics
  useEffect(() => {
    // Function to load system metrics from the API
    const loadMetrics = async () => {
      if (!deviceId) {
        console.error("Missing deviceId");
        return;
      }
      
      try {
        setLoading(true);
        // Get user ID from localStorage (stored during login)
        const user = localStorage.getItem('user');
        if (!user) {
          return;
        }
        
        // Parse user data with error handling
        let userId;
        try {
          userId = JSON.parse(user).id;
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          return;
        }
        
        if (!userId) {
          console.error("Missing userId");
          return;
        }
        
        console.log(`Loading metrics for user ${userId}, device ${deviceId}`);
        
        // Fetch all metrics in parallel using Promise.all for efficiency
        const [cpuData, ramData, diskData, batteryData, processData] = await Promise.all([
          fetchCpuUsage(userId, deviceId),
          fetchRamUsage(userId, deviceId),
          fetchDiskUsage(userId, deviceId),
          fetchBatteryInfo(userId, deviceId),
          fetchProcessStatuses(userId, deviceId)
        ]);
        
        console.log("API Responses:", { cpuData, ramData, diskData, batteryData, processData });
        
        // Handle diskData as array (new format) or as a single object (old format)
        const diskUsage = Array.isArray(diskData) && diskData.length > 0 
          ? diskData[0]  // Use the first disk's data for the overview card
          : diskData || { sizeGB: 512, usedGB: 256, availableGB: 256 };
        
        // Format and store all metrics data in state with fallbacks for missing data
        setMetrics({
          cpu: {
            usage: cpuData?.totalCpuLoad || 0,
            cores: 8
          },
          memory: {
            total: ramData?.totalMemory || 16,
            used: ramData?.usedMemory || 8,
            free: ramData?.availableMemory || 8
          },
          disk: {
            total: diskUsage.sizeGB || 512,
            used: diskUsage.usedGB || 256,
            free: diskUsage.availableGB || 256
          },
          battery: {
            percentage: batteryData?.batteryPercentage || 100,
            charging: batteryData?.isCharging || false
          },
          processes: processData || []
        });
        
        setLoading(false);
      } catch (error) {
        // Handle any unexpected errors
        console.error('Error loading metrics:', error);
        setLoading(false);
      }
    };

    // Only load metrics if we have a deviceId
    if (deviceId) {
      loadMetrics();
      // Set up interval to refresh metrics every 5 seconds
      const interval = setInterval(loadMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [deviceId]); // Re-run effect when deviceId changes

  // Configuration for metric cards with display values, icons and navigation paths
  const metricCards = [
    {
      title: 'CPU Usage',
      icon: <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
             <path d="M13 7H7v6h6V7z" />
             <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>,
      value: typeof metrics.cpu.usage === 'number' ? Math.round(metrics.cpu.usage) : 0,
      unit: '%',
      path: 'cpu',
      color: 'blue'
    },
    {
      title: 'Memory',
      icon: <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>,
      value: typeof metrics.memory.used === 'number' ? Math.round(metrics.memory.used) : 0,
      unit: 'GB',
      path: 'memory',
      color: 'purple'
    },
    {
      title: 'Disk Usage',
      icon: <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5c0 .526-.27.988-.659 1.256a6.012 6.012 0 01-2.706 1.912A6.049 6.049 0 014 10c0-.669.216-1.296.596-1.812a6.023 6.023 0 01-.587-1.907 6.15 6.15 0 00.323.747zM10 8c0 .374-.356.875-1.275 1.458-.619.392-1.513.698-2.624.698-.347 0-.675-.024-.983-.069l.021-.004A6.007 6.007 0 012 10c0 1.16.328 2.242.897 3.16C4.145 13.98 6.136 14.5 8 14.5c2.865 0 5-1.343 5-3 0-.529-.157-1.122-.518-1.666.232-.452.352-.96.352-1.484 0-1.657-1.343-3-3-3-1.545 0-2.622 1.186-2.834 2.383C6.384 8.08 6 8.469 6 9c0 .108.036.205.097.283a3.019 3.019 0 00-.087.227c-.343.904-.546 1.598-.546 2.49 0 1.659 1.6 3 3.6 3 1.545 0 2.622-1.186 2.834-2.383.066.008.132.013.2.013.552 0 .976-.29 1.243-.81-.455-.07-.843-.366-1.097-.82a2.954 2.954 0 01-.404 1.064c-.386-.322-.724-.827-.942-1.44a4.012 4.012 0 01.363-.678c.336-.493.639-1.05.859-1.647.053-.148.127-.366.293-.38a1.01 1.01 0 00.586-.15 1.04 1.04 0 00.396-.432c.082-.173.111-.377.111-.567 0-.638-.51-1-1.2-1a1.45 1.45 0 00-1.18.656.88.88 0 00-.149.448c0 .01.003.02.007.03z" clipRule="evenodd" />
            </svg>,
      value: (metrics.disk.used && metrics.disk.total) 
        ? Math.round((metrics.disk.used / metrics.disk.total) * 100) 
        : 0,
      unit: '%',
      path: 'disk',
      color: 'green'
    },
    {
      title: 'Battery',
      icon: <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM6 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4zm5-1a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
            </svg>,
      value: typeof metrics.battery.percentage === 'number' ? metrics.battery.percentage : 0,
      unit: '%',
      path: 'battery',
      color: 'indigo'
    },
    {
      title: 'Processes',
      icon: <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>,
      value: Array.isArray(metrics.processes) ? metrics.processes.length : 0,
      unit: 'active',
      path: 'processes',
      color: 'teal'
    }
  ];

  // Render error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors">
              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Devices
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Device Overview</h1>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center text-red-500 mb-4">
              <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-semibold">Error Loading Device</h2>
            </div>
            <p className="mb-6 text-gray-600">{error}</p>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-md hover:from-indigo-700 hover:to-blue-600 transition-colors shadow-md flex items-center"
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching data
  if (loading && !deviceInfo) {
    return (
      <LoadingScreen message="Loading device information..." />
    );
  }

  // Main component render with device info and metric cards
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors">
            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Devices
          </Link>
          <div className="flex justify-between items-center mt-2">
            <h1 className="text-2xl font-bold text-gray-900">Device Overview</h1>
            <span className="text-xs text-gray-500">Last updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Device specifications card */}
        <div className="mb-8">
          <DeviceInfoCard deviceInfo={deviceInfo} />
        </div>

        {/* Performance summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Performance Metrics</h2>
          <p className="text-gray-600 text-sm">Click on any metric card to view detailed information and historical data</p>
        </div>

        {/* Grid of metric cards for system metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricCards.map((card) => (
            <MetricCard
              key={card.title}
              {...card}
              onClick={() => navigate(`/dashboard/device/${deviceId}/${card.path}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails; 