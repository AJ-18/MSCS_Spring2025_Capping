// Mock metrics for development
const getMockMetrics = () => ({
  cpu: {
    usage: Math.floor(Math.random() * 100),        // Random CPU usage between 0-100%
    cores: Array(4).fill(0).map(() => ({          // Simulate 4 cores
      load: Math.floor(Math.random() * 100)
    })),
    temperature: Math.floor(Math.random() * 30) + 40 // Random temperature between 40-70°C
  },
  memory: {
    used: Math.floor(Math.random() * 8 * 1024),   // Random RAM usage up to 8GB (in MB)
    total: 8 * 1024,                              // 8GB total RAM (in MB)
    free: Math.floor(Math.random() * 4 * 1024),   // Random free RAM up to 4GB (in MB)
    cached: Math.floor(Math.random() * 2 * 1024)  // Random cached RAM up to 2GB (in MB)
  },
  disk: {
    used: Math.floor(Math.random() * 256 * 1024), // Random disk usage up to 256GB (in MB)
    total: 256 * 1024,                            // 256GB total disk space (in MB)
    read: Math.floor(Math.random() * 100),        // Random read speed in MB/s
    write: Math.floor(Math.random() * 100)        // Random write speed in MB/s
  },
  battery: {
    percentage: 100,                              // Battery percentage
    isCharging: true,                             // Charging status
    timeRemaining: '2:30'                         // Time remaining
  },
  network: {
    upload: Math.floor(Math.random() * 10),       // Random upload speed in MB/s
    download: Math.floor(Math.random() * 50),     // Random download speed in MB/s
    latency: Math.floor(Math.random() * 100)      // Random latency in ms
  },
  processes: Array(10).fill(0).map((_, i) => ({   // Top 10 processes
    pid: Math.floor(Math.random() * 10000),
    name: ['Chrome', 'Firefox', 'VSCode', 'Node', 'Spotify'][Math.floor(Math.random() * 5)],
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 1024),
    status: ['running', 'sleeping', 'waiting'][Math.floor(Math.random() * 3)]
  }))
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