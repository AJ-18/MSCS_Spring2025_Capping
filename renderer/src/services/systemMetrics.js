import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Mock metrics for development that match our API structure
const getMockMetrics = () => ({
  batteryInfo: {
    hasBattery: true,
    batteryPercentage: 85,
    isCharging: false,
    powerConsumption: 5.0
  },
  cpuUsage: {
    totalCpuLoad: 42.5,
    perCoreUsageJson: JSON.stringify(Array(8).fill(0).map((_, i) => ({
      core: i + 1,
      usage: Math.random() * 100
    })))
  },
  ramUsage: {
    totalMemory: 16.0,
    usedMemory: 7.2,
    availableMemory: 8.8
  },
  diskIO: {
    readSpeedMBps: 120.0,
    writeSpeedMBps: 80.0
  },
  diskUsage: {
    filesystem: '/dev/sda1',
    sizeGB: 512.0,
    usedGB: 200.0,
    availableGB: 312.0
  },
  processStatuses: Array(20).fill(0).map((_, i) => ({
    pid: 1000 + i,
    name: ['chrome', 'code', 'node', 'spotify'][Math.floor(Math.random() * 4)],
    cpuUsage: Math.random() * 10,
    memoryMB: Math.random() * 500
  }))
});

// Create authenticated axios instance
const createAuthenticatedClient = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Fetch metrics from the API
const fetchMetricsFromAPI = async (endpoint, userId, deviceId) => {
  try {
    const client = createAuthenticatedClient();
    const response = await client.get(`/api/metrics/${endpoint}/${userId}/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const fetchSystemMetrics = async () => {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock metrics in development mode');
      return getMockMetrics();
    }

    // If we're in production, fetch real metrics
    const userId = localStorage.getItem('userId');
    const deviceId = localStorage.getItem('deviceId');

    if (!userId || !deviceId) {
      throw new Error('Missing user ID or device ID');
    }

    // Fetch all metrics in parallel
    const [
      batteryInfo,
      cpuUsage,
      ramUsage,
      diskIO,
      diskUsage,
      processStatuses
    ] = await Promise.all([
      fetchMetricsFromAPI('battery-info', userId, deviceId),
      fetchMetricsFromAPI('cpu-usage', userId, deviceId),
      fetchMetricsFromAPI('ram-usage', userId, deviceId),
      fetchMetricsFromAPI('disk-io', userId, deviceId),
      fetchMetricsFromAPI('disk-usage', userId, deviceId),
      fetchMetricsFromAPI('process-status', userId, deviceId)
    ]);

    return {
      batteryInfo,
      cpuUsage,
      ramUsage,
      diskIO,
      diskUsage,
      processStatuses
    };
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    if (process.env.NODE_ENV === 'development') {
      return getMockMetrics();
    }
    throw error;
  }
};