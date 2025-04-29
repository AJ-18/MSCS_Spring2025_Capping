import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Mock metrics for development that match our API structure
const getMockMetrics = () => ({
  cpu: {
    usage: Math.random() * 80 + 10,
    cores: 8,
    temperature: Math.random() * 30 + 40
  },
  memory: {
    total: 16 * 1024,
    used: (Math.random() * 8 + 4) * 1024,
    free: (Math.random() * 4) * 1024
  },
  disk: {
    total: 512 * 1024,
    used: (Math.random() * 300 + 100) * 1024,
    free: (Math.random() * 100) * 1024,
    read: Math.random() * 100,
    write: Math.random() * 50
  },
  battery: {
    percentage: Math.random() * 100,
    charging: Math.random() > 0.5,
    timeRemaining: Math.random() * 300
  },
  network: {
    download: Math.random() * 10,
    upload: Math.random() * 2
  },
  processes: Array(10).fill(0).map((_, i) => ({
    pid: 1000 + i,
    name: ['chrome', 'code', 'node', 'spotify'][Math.floor(Math.random() * 4)],
    cpu: Math.random() * 10,
    memory: Math.random() * 500,
    time: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`
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
    console.log(`Fetching ${endpoint} for userId: ${userId}, deviceId: ${deviceId}`);
    const response = await client.get(`/api/metrics/${endpoint}/${userId}/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const fetchSystemMetrics = async (userId, deviceId) => {
  try {
    console.log('fetchSystemMetrics called with:', { userId, deviceId });
    
    // If userId or deviceId are not provided, try to get them from localStorage
    if (!userId) userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!deviceId) deviceId = localStorage.getItem('deviceId');
    
    // Check if we still don't have the required IDs
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID');
      return getMockMetrics(); // Return mock data for development
    }

    // For development, just return mock data
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock metrics in development mode');
      return getMockMetrics();
    }

    // If we're in production, fetch real metrics
    try {
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

      // Map API response to the format expected by the UI
      return {
        cpu: {
          usage: cpuUsage.totalCpuLoad,
          cores: 8, // This should come from device info
          temperature: 45 // This might not be available from the API
        },
        memory: {
          total: ramUsage.totalMemory * 1024,
          used: ramUsage.usedMemory * 1024,
          free: ramUsage.availableMemory * 1024
        },
        disk: {
          total: diskUsage.sizeGB * 1024,
          used: diskUsage.usedGB * 1024,
          free: diskUsage.availableGB * 1024,
          read: diskIO.readSpeedMBps,
          write: diskIO.writeSpeedMBps
        },
        battery: {
          percentage: batteryInfo.batteryPercentage,
          charging: batteryInfo.isCharging,
          timeRemaining: 0 // Not available from API
        },
        network: {
          download: 0, // Not available in current API
          upload: 0 // Not available in current API
        },
        processes: processStatuses.map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpuUsage,
          memory: p.memoryMB,
          time: '0:00:00' // Not available from API
        }))
      };
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return getMockMetrics(); // Fallback to mock data
    }
  } catch (error) {
    console.error('Error in fetchSystemMetrics:', error);
    return getMockMetrics(); // Return mock data as fallback
  }
};