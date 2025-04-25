// Mock metrics for development
const getMockMetrics = () => ({
  cpu: {
    usage: Math.floor(Math.random() * 100),        // Random CPU usage between 0-100%
    cores: Array(4).fill(0).map(() => ({          // Simulate 4 cores
      load: Math.floor(Math.random() * 100)
    }))
  },
  memory: {
    used: Math.floor(Math.random() * 8 * 1024),   // Random RAM usage up to 8GB (in MB)
    total: 8 * 1024,                              // 8GB total RAM (in MB)
  },
  disk: {
    used: Math.floor(Math.random() * 256 * 1024), // Random disk usage up to 256GB (in MB)
    total: 256 * 1024,                            // 256GB total disk space (in MB)
  }
});

export const fetchSystemMetrics = async () => {
  try {
    // Check if we're in development mode (no Electron API)
    if (!window.electronAPI?.getSystemMetrics) {
      console.log('Using mock metrics in development mode');
      return getMockMetrics();
    }

    // If Electron API is available, use it
    const data = await window.electronAPI.getSystemMetrics();
    return data;
  } catch (error) {
    console.warn('Error fetching system metrics:', error);
    // Fallback to mock data if there's an error
    return getMockMetrics();
  }
};