import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mscs-spring2025-capping.onrender.com';

/**
 * Generate mock metrics data for development and testing purposes
 * Creates realistic looking system performance data
 * @returns {Object} Mock metrics data object
 */
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
  processes: Array(30).fill(0).map((_, i) => ({
    pid: 1000 + i,
    name: ['chrome', 'code', 'node', 'spotify'][Math.floor(Math.random() * 4)],
    cpu: Math.random() * 10,
    memory: Math.random() * 500,
    time: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`
  }))
});

/**
 * Creates an axios instance with authentication headers
 * Uses token from localStorage for authorization
 * @returns {Object} Configured axios instance
 */
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

/**
 * Base function to fetch metrics from the API
 * Generic function used by specific metric fetchers
 * 
 * @param {string} endpoint - API endpoint to fetch from
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID
 * @returns {Promise<Object>} Metrics data
 * @throws {Error} If fetching fails
 */
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

/**
 * Fetches device specifications from the API or metrics poller
 * Gets detailed hardware/software information about the device
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Object|null>} Device specifications or null if unavailable
 */
export const fetchDeviceSpecifications = async (userId, deviceId) => {
  try {
    if (!userId) {
      userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      console.log("Device specifications using userId from localStorage:", userId);
    }
    
    if (!deviceId) {
      deviceId = localStorage.getItem('deviceId');
      console.log("Device specifications using deviceId from localStorage:", deviceId);
    }
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for device specifications', { userId, deviceId });
      return null;
    }

    console.log(`Fetching device specifications for userId: ${userId}, deviceId: ${deviceId}`);
    
    // In production, fetch from real API
    if (process.env.NODE_ENV === 'production') {
      try {
        // Try fetching device specifications from the API
        const client = createAuthenticatedClient();
        const response = await client.get(`/api/users/${userId}/devices/${deviceId}`);
        console.log("Device specifications from API:", response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching device specifications from API:', error);
        // Fall back to the performance metrics poller
        if (window.metrics && window.metrics.getDeviceInfo) {
          const deviceInfo = await window.metrics.getDeviceInfo();
          console.log("Device specifications from metrics poller:", deviceInfo);
          return deviceInfo;
        }
        throw error;
      }
    } else {
      // For development, return data from electron bridge if available
      if (window.metrics && window.metrics.getDeviceInfo) {
        const deviceInfo = await window.metrics.getDeviceInfo();
        console.log("Device specifications from metrics poller:", deviceInfo);
        return deviceInfo;
      }
      
      // Fallback to realistic mock data
      return {
        deviceId: deviceId,
        deviceName: "Your Computer",
        manufacturer: "Detected Manufacturer",
        model: "Detected Model",
        processor: "Detected CPU",
        cpuPhysicalCores: 4,
        cpuLogicalCores: 8,
        installedRam: 16.0,
        graphics: "Detected Graphics Card",
        operatingSystem: "Detected OS",
        systemType: "Detected Arch"
      };
    }
  } catch (error) {
    console.error('Error fetching device specifications:', error);
    return null;
  }
};

/**
 * Fetches battery information
 * Gets battery status, charge percentage, and power consumption
 * Properly handles devices without batteries (like desktop computers)
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Object>} Battery information or fallback data if unavailable
 */
export const fetchBatteryInfo = async (userId, deviceId) => {
  try {
    if (!userId) userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!deviceId) deviceId = localStorage.getItem('deviceId');
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for battery info');
      return { 
        hasBattery: false,
        batteryPercentage: 0,
        isCharging: false,
        powerConsumption: 0
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      // Get device information to check if this is likely a desktop
      try {
        const deviceData = await fetchDeviceSpecifications(userId, deviceId);
        const deviceName = deviceData?.deviceName?.toLowerCase() || '';
        
        // Check if this is likely a desktop computer based on the name
        if (deviceName.includes('desktop') || 
            deviceName.includes('tower') || 
            deviceName.includes('workstation') ||
            deviceName.includes('server') ||
            // Common motherboard indicators
            deviceName.includes('b550') || 
            deviceName.includes('b650') || 
            deviceName.includes('x570') ||
            deviceName.includes('z690') ||
            deviceName.includes('aorus') || 
            deviceName.includes('rog') ||
            deviceName.includes('asrock')) {
          
          // Return desktop-appropriate values
          return { 
            hasBattery: false,
            batteryPercentage: 0,
            isCharging: false,
            powerConsumption: 0
          };
        }
      } catch (error) {
        console.log('Error checking device type for battery info', error);
        // Continue with default battery info if device check fails
      }
      
      // Default for development mode - simulate a laptop
      return { 
        hasBattery: true,
        batteryPercentage: Math.floor(Math.random() * 100),
        isCharging: Math.random() > 0.5,
        powerConsumption: (Math.random() * 15 + 5).toFixed(2)
      };
    }

    // Production mode - get real data from API
    const batteryData = await fetchMetricsFromAPI('battery-info', userId, deviceId);
    
    // Ensure hasBattery property is present and properly formatted
    // Some systems might return missing battery as null instead of false
    return {
      ...batteryData,
      hasBattery: batteryData.hasBattery === 1 || batteryData.hasBattery === true
    };
  } catch (error) {
    console.error('Error fetching battery info:', error);
    return { 
      hasBattery: false,
      batteryPercentage: 0,
      isCharging: false,
      powerConsumption: 0
    };
  }
};

/**
 * Fetches CPU usage information
 * Gets total CPU load and per-core usage statistics
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Object>} CPU usage data or fallback data if unavailable
 */
export const fetchCpuUsage = async (userId, deviceId) => {
  try {
    if (!userId) userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!deviceId) deviceId = localStorage.getItem('deviceId');
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for CPU usage');
      return { 
        totalCpuLoad: 42.5,
        perCoreUsageJson: JSON.stringify([{core: 1, usage: 35.0}])
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      return { 
        totalCpuLoad: Math.random() * 80 + 10,
        perCoreUsageJson: JSON.stringify(
          Array(8).fill(0).map((_, i) => ({
            core: i + 1,
            usage: Math.random() * 80 + 10
          }))
        )
      };
    }

    return await fetchMetricsFromAPI('cpu-usage', userId, deviceId);
  } catch (error) {
    console.error('Error fetching CPU usage:', error);
    return { 
      totalCpuLoad: 42.5,
      perCoreUsageJson: JSON.stringify([{core: 1, usage: 35.0}])
    };
  }
};

/**
 * Fetches RAM usage information
 * Gets memory statistics including total, used, and available RAM
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Object>} RAM usage data or fallback data if unavailable
 */
export const fetchRamUsage = async (userId, deviceId) => {
  try {
    if (!userId) {
      userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      console.log("Ram usage using userId from localStorage:", userId);
    }
    
    if (!deviceId) {
      deviceId = localStorage.getItem('deviceId');
      console.log("Ram usage using deviceId from localStorage:", deviceId);
    }
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for RAM usage', { userId, deviceId });
      return { 
        totalMemory: 16.0,
        usedMemory: 7.2,
        availableMemory: 8.8
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log("Using development mock data for RAM usage");
      const total = 16.0;
      const used = parseFloat((Math.random() * 8 + 4).toFixed(1));
      return { 
        totalMemory: total,
        usedMemory: used,
        availableMemory: parseFloat((total - used).toFixed(1))
      };
    }

    console.log(`Fetching RAM usage for userId: ${userId}, deviceId: ${deviceId}`);
    const data = await fetchMetricsFromAPI('ram-usage', userId, deviceId);
    console.log("RAM usage data received:", data);
    
    // Ensure numeric values for memory metrics
    return {
      totalMemory: parseFloat(data.totalMemory) || 16.0,
      usedMemory: parseFloat(data.usedMemory) || 7.2,
      availableMemory: parseFloat(data.availableMemory) || 8.8
    };
  } catch (error) {
    console.error('Error fetching RAM usage:', error);
    return { 
      totalMemory: 16.0,
      usedMemory: 7.2,
      availableMemory: 8.8
    };
  }
};

/**
 * Fetches disk I/O performance information
 * Gets disk read and write speeds
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Object>} Disk I/O data or fallback data if unavailable
 */
export const fetchDiskIO = async (userId, deviceId) => {
  try {
    if (!userId) userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!deviceId) deviceId = localStorage.getItem('deviceId');
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for Disk I/O');
      return { 
        readSpeedMBps: 120.0,
        writeSpeedMBps: 80.0
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      return { 
        readSpeedMBps: Math.random() * 200 + 50,
        writeSpeedMBps: Math.random() * 150 + 40
      };
    }

    return await fetchMetricsFromAPI('disk-io', userId, deviceId);
  } catch (error) {
    console.error('Error fetching Disk I/O:', error);
    return { 
      readSpeedMBps: 120.0,
      writeSpeedMBps: 80.0
    };
  }
};

/**
 * Fetches disk usage information
 * Gets storage capacity, used space, and available space
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Object>} Disk usage data or fallback data if unavailable
 */
export const fetchDiskUsage = async (userId, deviceId) => {
  try {
    if (!userId) userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!deviceId) deviceId = localStorage.getItem('deviceId');
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for Disk Usage');
      return [{ 
        filesystem: "/dev/sda1",
        sizeGB: 512.0,
        usedGB: 200.0,
        availableGB: 312.0
      }];
    }

    if (process.env.NODE_ENV !== 'production') {
      const size1 = 512.0;
      const used1 = Math.random() * 300 + 100;
      const size2 = 256.0;
      const used2 = Math.random() * 150 + 50;
      return [
        { 
          filesystem: "C:",
          sizeGB: size1,
          usedGB: used1,
          availableGB: size1 - used1
        },
        { 
          filesystem: "D:",
          sizeGB: size2,
          usedGB: used2,
          availableGB: size2 - used2
        }
      ];
    }

    return await fetchMetricsFromAPI('disk-usage', userId, deviceId);
  } catch (error) {
    console.error('Error fetching Disk Usage:', error);
    return [{ 
      filesystem: "/dev/sda1",
      sizeGB: 512.0,
      usedGB: 200.0,
      availableGB: 312.0
    }];
  }
};

/**
 * Fetches network interface information
 * Gets network adapter details including IPs and connection speeds
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Array>} Network interfaces data or empty array if unavailable
 */
export const fetchNetworkInterfaces = async (userId, deviceId) => {
  try {
    if (!userId) userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!deviceId) deviceId = localStorage.getItem('deviceId');
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for Network Interfaces');
      return [];
    }

    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          name: "eth0",
          macAddress: "AA:BB:CC:DD:EE:FF",
          ipv4: "192.168.1.100",
          ipv6: "fe80::1234:5678:abcd:ef00",
          speedMbps: 1000
        },
        {
          name: "wlan0",
          macAddress: "11:22:33:44:55:66",
          ipv4: "192.168.1.101",
          ipv6: "fe80::abcd:1234:5678:ef00",
          speedMbps: 300
        }
      ];
    }

    return await fetchMetricsFromAPI('network-interfaces', userId, deviceId);
  } catch (error) {
    console.error('Error fetching Network Interfaces:', error);
    return [];
  }
};

/**
 * Fetches process information
 * Gets running processes with their resource usage statistics
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Array>} Process status data or fallback data if unavailable
 */
export const fetchProcessStatuses = async (userId, deviceId) => {
  try {
    if (!userId) userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!deviceId) deviceId = localStorage.getItem('deviceId');
    
    if (!userId || !deviceId) {
      console.error('Missing user ID or device ID for Process Statuses');
      return [
        { pid: 1234, name: "chrome", cpuUsage: 2.5, memoryMB: 150.0 },
        { pid: 5678, name: "code", cpuUsage: 1.8, memoryMB: 120.0 }
      ];
    }

    if (process.env.NODE_ENV !== 'production') {
      return Array(30).fill(0).map((_, i) => ({
        pid: 1000 + i,
        name: ['chrome', 'code', 'node', 'spotify', 'slack', 'discord'][Math.floor(Math.random() * 6)],
        cpuUsage: Math.random() * 10,
        memoryMB: Math.random() * 500 + 50
      }));
    }

    const processData = await fetchMetricsFromAPI('process-status', userId, deviceId);
    
    // Debug memory values specifically for Opera
    if (Array.isArray(processData)) {
      const operaProcess = processData.find(p => p.name === 'opera.exe');
      if (operaProcess) {
        console.log(`API SERVICE - Opera original memory: ${operaProcess.memoryMB} MB`);
      }
    }
    
    // Log raw process data from API
    console.log('Raw process data from API:');
    if (Array.isArray(processData) && processData.length > 0) {
      console.log('First 3 processes:');
      processData.slice(0, 3).forEach(p => {
        console.log(`Name: ${p.name}, CPU: ${p.cpuUsage}, Memory: ${p.memoryMB} MB`);
      });
      
      // Check for specific processes by name
      const knownProcesses = ['opera', 'chrome', 'discord', 'electron'];
      knownProcesses.forEach(name => {
        const proc = processData.find(p => p.name && p.name.toLowerCase().includes(name));
        if (proc) {
          console.log(`Found ${name}: CPU=${proc.cpuUsage}, Memory=${proc.memoryMB} MB`);
        }
      });
    }
    
    // Validate and normalize the process data before returning
    if (Array.isArray(processData)) {
      const normalizedData = processData.map(process => {
        // Ensure all fields exist and are properly typed
        const normalized = {
          pid: typeof process.pid === 'number' ? process.pid : 0,
          name: typeof process.name === 'string' ? process.name : 'Unknown',
          // Ensure CPU usage is a reasonable percentage (0-100%)
          cpuUsage: typeof process.cpuUsage === 'number' ? 
            Math.min(Math.max(process.cpuUsage, 0), 100) : 0,
          // Ensure memory is in MB and is a reasonable value
          memoryMB: typeof process.memoryMB === 'number' ? 
            // Cap absurdly high memory values
            Math.min(process.memoryMB, 16000) : 0
        };
        
        return normalized;
      });
      
      // Log the normalized values for comparison
      if (normalizedData.length > 0) {
        console.log('After normalization, first 3 processes:');
        normalizedData.slice(0, 3).forEach(p => {
          console.log(`Name: ${p.name}, CPU: ${p.cpuUsage}, Memory: ${p.memoryMB} MB`);
        });
        
        // Check Opera again after normalization
        const operaProcess = normalizedData.find(p => p.name === 'opera.exe');
        if (operaProcess) {
          console.log(`API SERVICE - Opera normalized memory: ${operaProcess.memoryMB} MB`);
        }
      }
      
      return normalizedData;
    }
    
    return processData || [];
  } catch (error) {
    console.error('Error fetching Process Statuses:', error);
    return [
      { pid: 1234, name: "chrome", cpuUsage: 2.5, memoryMB: 150.0 },
      { pid: 5678, name: "code", cpuUsage: 1.8, memoryMB: 120.0 }
    ];
  }
};

/**
 * Main function to fetch all system metrics
 * Aggregates data from individual metric fetchers
 * 
 * @param {string} [userId] - User ID, will attempt to get from localStorage if not provided
 * @param {string} [deviceId] - Device ID, will attempt to get from localStorage if not provided
 * @returns {Promise<Object>} Combined system metrics or mock data if unavailable
 */
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
        fetchBatteryInfo(userId, deviceId),
        fetchCpuUsage(userId, deviceId),
        fetchRamUsage(userId, deviceId),
        fetchDiskIO(userId, deviceId),
        fetchDiskUsage(userId, deviceId),
        fetchProcessStatuses(userId, deviceId)
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
          total: Array.isArray(diskUsage) && diskUsage.length > 0 
            ? diskUsage[0].sizeGB * 1024 
            : diskUsage.sizeGB * 1024,
          used: Array.isArray(diskUsage) && diskUsage.length > 0 
            ? diskUsage[0].usedGB * 1024 
            : diskUsage.usedGB * 1024,
          free: Array.isArray(diskUsage) && diskUsage.length > 0 
            ? diskUsage[0].availableGB * 1024 
            : diskUsage.availableGB * 1024,
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