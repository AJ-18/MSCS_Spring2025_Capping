import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DeviceInfoCard from './DeviceInfoCard';
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
const MetricCard = ({ title, icon, value, unit, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-gray-700 text-lg">{title}</h3>
      <span className="text-gray-500">{icon}</span>
    </div>
    <div className="flex items-baseline">
      <span className="text-4xl font-semibold text-gray-900">{value}</span>
      <span className="text-gray-500 text-sm ml-1">{unit}</span>
    </div>
  </div>
);

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
            total: diskData?.sizeGB || 512,
            used: diskData?.usedGB || 256,
            free: diskData?.availableGB || 256
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

  // Configuration for metric cards with display values and navigation paths
  const metricCards = [
    {
      title: 'CPU Usage',
      icon: '📊',
      value: typeof metrics.cpu.usage === 'number' ? Math.round(metrics.cpu.usage) : 0,
      unit: '%',
      path: 'cpu'
    },
    {
      title: 'Memory',
      icon: '💾',
      value: typeof metrics.memory.used === 'number' ? Math.round(metrics.memory.used) : 0,
      unit: 'GB',
      path: 'memory'
    },
    {
      title: 'Disk Usage',
      icon: '💿',
      value: (metrics.disk.used && metrics.disk.total) 
        ? Math.round((metrics.disk.used / metrics.disk.total) * 100) 
        : 0,
      unit: '%',
      path: 'disk'
    },
    {
      title: 'Battery',
      icon: '🔋',
      value: typeof metrics.battery.percentage === 'number' ? metrics.battery.percentage : 0,
      unit: '%',
      path: 'battery'
    },
    {
      title: 'Processes',
      icon: '⚙️',
      value: Array.isArray(metrics.processes) ? metrics.processes.length : 0,
      unit: 'active',
      path: 'processes'
    }
  ];

  // Render error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/dashboard" className="text-blue-500 hover:text-blue-600 text-sm">
              ← Back to Devices
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Device Overview</h1>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-red-500 mb-4">Error</div>
            <p className="mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main component render with device info and metric cards
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-600 text-sm">
            ← Back to Devices
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Device Overview</h1>
        </div>

        {/* Device specifications card */}
        <div className="mb-8">
          <DeviceInfoCard deviceInfo={deviceInfo} />
        </div>

        {/* Grid of metric cards for system metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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