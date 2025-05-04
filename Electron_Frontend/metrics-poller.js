/**
 * Metrics Poller Module
 * 
 * Collects and sends system metrics to the backend API.
 * Handles device registration, metrics collection, and periodic reporting.
 * Uses systeminformation, perfmon, and other libraries to gather detailed system data.
 */

// Import required libraries for system metrics collection
const si       = require('systeminformation');  // Main system information library
const psList   = require('@trufflesuite/ps-list');  // Process list utility
const perfmon  = require('perfmon');  // Windows performance monitor interface
const { exec } = require('child_process');  // For executing shell commands
const { promisify } = require('util');  // Utility to convert callbacks to promises
const axios    = require('axios');  // HTTP client for API calls

// Convert exec to return a promise instead of using callbacks
const execAsync = promisify(exec);

/**
 * Perfmon counter configuration for disk I/O monitoring
 * These counters track disk read and write speeds on Windows
 */
const diskCounters = [
  '\\PhysicalDisk(_Total)\\Disk Read Bytes/sec',
  '\\PhysicalDisk(_Total)\\Disk Write Bytes/sec'
];

/**
 * Initialize perfmon stream for real-time disk I/O monitoring
 * Sets up data collection that will continuously update in the background
 */
const diskIOStream = perfmon(diskCounters);
let latestDiskIO = { 
  [diskCounters[0]]: 0, 
  [diskCounters[1]]: 0 
};
diskIOStream.on('data', stat => { latestDiskIO = stat.counters; });
diskIOStream.on('error', err => { console.error('perfmon error:', err); });

/**
 * Retrieves process memory usage from Windows Management Instrumentation (WMI)
 * Creates a mapping of process IDs to their memory usage
 * 
 * @returns {Promise<Object>} Map of PIDs to memory usage in bytes
 */
async function getWmiMemoryMap() {
  try {
    const { stdout } = await execAsync(
      'wmic process get ProcessId,WorkingSetSize /FORMAT:CSV'
    );
    const lines = stdout.trim().split(/\r?\n/).slice(1);
    const map = {};
    for (let line of lines) {
      const [ , pidStr, wsStr ] = line.split(',');
      const pid = parseInt(pidStr, 10);
      const ws  = parseInt(wsStr, 10);
      if (!isNaN(pid) && !isNaN(ws)) {
        map[pid] = ws;
      }
    }
    return map;
  } catch (e) {
    console.error('WMI memory fetch failed:', e);
    return {};
  }
}

/**
 * MetricsPoller Class
 * Handles device registration, metrics collection, and reporting to the backend
 */
class MetricsPoller {
  /**
   * Constructor
   * Initializes the poller with no active interval or configuration
   */
  constructor() {
    this.pollingInterval = null;
    this.config          = null;
  }

  /**
   * Collects basic device information
   * Gathers hardware and OS details for device identification
   * 
   * @returns {Promise<Object>} Device specifications and identifiers
   */
  async collectDeviceInfo() {
    const [ system, cpu, graphics, os, mem ] = await Promise.all([
      si.system(), si.cpu(), si.graphics(), si.osInfo(), si.mem()
    ]);

    return {
      deviceName:       system.model,
      manufacturer:     system.manufacturer,
      model:            system.model,
      processor:        `${cpu.manufacturer} ${cpu.brand} ${cpu.speed} GHz`,
      cpuPhysicalCores: cpu.physicalCores,
      cpuLogicalCores:  cpu.cores,
      installedRam:     mem.total / 1024**3,
      graphics:         graphics.controllers[0]?.model || 'N/A',
      operatingSystem:  `${os.distro} ${os.release} ${os.arch}`,
      systemType:       `${os.arch} OS, ${cpu.manufacturer}-based CPU`
    };
  }

  /**
   * Registers the current device with the backend API
   * Collects device info and sends it to the server to create a device record
   * 
   * @param {string} baseUrl - Base URL of the API
   * @param {string} token - Authentication token
   * @param {string} userId - User ID to associate with the device
   * @returns {Promise<string>} Device ID returned from the server
   * @throws {Error} If registration fails
   */
  async registerDevice(baseUrl, token, userId) {
    try {
      if (!baseUrl || !token || !userId) {
        console.error('Missing required parameters for device registration:', { 
          hasBaseUrl: !!baseUrl, 
          hasToken: !!token, 
          hasUserId: !!userId 
        });
        throw new Error('Missing required parameters for device registration');
      }

      console.log('Registering device for user:', userId);
      const deviceInfo = await this.collectDeviceInfo();

      // Format payload according to what backend expects
      // Based on Postman collection, it may expect a user object with the id
      const payload = {
        ...deviceInfo,
        user: { id: userId }
      };

      console.log('Device registration payload:', payload);
      
      // Register the device using the POST endpoint for adding devices
      console.log('Sending device registration request to:', `${baseUrl}/api/users/${userId}/devices`);
      const res = await axios.post(
        `${baseUrl}/api/users/${userId}/devices`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Device registration response:', res.data);
      const devices = Array.isArray(res.data) ? res.data : [res.data];
      if (!devices.length) {
        console.error('No devices returned from registration');
        throw new Error('No devices returned from registration');
      }

      // Find the matching device from the response
      const match = devices.find(d =>
        d.deviceName   === deviceInfo.deviceName &&
        d.manufacturer === deviceInfo.manufacturer &&
        d.model        === deviceInfo.model
      );

      // Get the device ID from either the matching device or the last device in the list
      const deviceId = match ? (match.deviceId || match.id) : 
                      (devices[devices.length-1].deviceId || devices[devices.length-1].id);
                      
      if (!deviceId) {
        console.error('No device ID found in response:', devices);
        throw new Error('Device registered but no device ID returned');
      }
      
      console.log('Device registered successfully with ID:', deviceId);
      return deviceId;
    } catch (err) {
      console.error('Device registration failed:', err.message);
      if (err.response) {
        console.error('API response error:', {
          status: err.response.status,
          data: err.response.data
        });
      }
      throw err;
    }
  }

  /**
   * Collects comprehensive system metrics
   * Gathers data about CPU, memory, disk, battery, and running processes
   * 
   * @returns {Promise<Object|null>} Collected metrics or null if no configuration
   */
  async collectSystemMetrics() {
    if (!this.config) {
      console.error('Metrics collection attempted without configuration');
      return null;
    }

    // WMI memory map
    const wmiMemMap = await getWmiMemoryMap();
	
	
    // Build per-PID CPU% map

    const procInfo = await si.processes();

    const cpuMap = {};

    procInfo.list.forEach(p => {

      cpuMap[p.pid] = p.cpu;

    });

    // Grab SI metrics
    const [ battery, load, mem, fsList ] = await Promise.all([
      si.battery(), si.currentLoad(), si.mem(), si.fsSize()
    ]);

    // Battery
    const batteryInfo = {
      hasBattery:       battery.hasBattery,
      batteryPercentage: battery.percent,
      isCharging:       battery.isCharging,
      powerConsumption: battery.powerConsumption || 0
    };

    // CPU
    const perCore = load.cpus.map((c,i) => ({ core:i+1, usage:c.load }));
    const cpuUsage = {
      totalCpuLoad:     load.currentLoad,
      perCoreUsageJson: JSON.stringify(perCore)
    };

    // RAM
    const ramUsage = {
      totalMemory:     mem.total     / 1024**3,
      usedMemory:      mem.used      / 1024**3,
      availableMemory: mem.available / 1024**3
    };

    // Disk I/O
    const readBps  = latestDiskIO[diskCounters[0]] || 0;
    const writeBps = latestDiskIO[diskCounters[1]] || 0;
    const diskIO = {
      readSpeedMBps:  readBps  / 1024**2,
      writeSpeedMBps: writeBps / 1024**2
    };

    // **All** filesystems
    const diskUsage = fsList.map(d => ({
      filesystem:  d.fs,
      sizeGB:      d.size      / 1024**3,
      usedGB:      d.used      / 1024**3,
      availableGB: d.available / 1024**3
    }));

   // Processes: group by name, avg-CPU & total RAM, pick one PID
    const procs = await psList();
    const groups = {};
    procs.forEach(p => {
      const name = p.name || 'unknown';
      if (!groups[name]) groups[name] = { pids:[], totalCpu:0, totalMem:0 };
      groups[name].pids.push(p.pid);
      groups[name].totalCpu += cpuMap[p.pid] || 0;          // avg CPU will come next
      groups[name].totalMem += (wmiMemMap[p.pid] || 0);     // total RAM bytes
    });

    const processStatuses = Object.entries(groups)
      .sort(([,a],[,b]) => b.totalMem - a.totalMem)        // sort by RAM
      .slice(0, 30)                                        // top 30
      .map(([name, stats]) => ({
        pid:      stats.pids[0],                           // first PID
        name:     name,                                    // just the executable name
        cpuUsage: stats.totalCpu / stats.pids.length,      // average CPU%
        memoryMB: stats.totalMem  / 1024**2                // total RAM in MB
      }));
    return {
      userId:          this.config.userId,
      deviceId:        this.config.deviceId,
      batteryInfo,
      cpuUsage,
      ramUsage,
      diskIO,
      diskUsage,
      processStatuses
    };
  }

  /**
   * Sends collected metrics to the backend API
   * Handles errors to prevent polling interruption
   */
  async sendBatchMetrics() {
    try {
      const payload = await this.collectSystemMetrics();
      if (!payload) return;
      
      await axios.post(
        `${this.config.baseUrl}/api/metrics/batch`,
        payload,
        { headers: { Authorization: `Bearer ${this.config.jwt}` } }
      );
    } catch (e) {
      console.error('Error sending batch metrics:', e);
    }
  }

  /**
   * Starts metrics collection and periodic reporting
   * Sets up a polling interval to collect and send metrics
   * 
   * @param {Object} config - Configuration object for metrics collection
   * @param {string} config.baseUrl - API base URL
   * @param {string} config.jwt - Authentication token
   * @param {string} config.userId - User ID
   * @param {string} [config.deviceId] - Device ID (optional, will be registered if not provided)
   * @throws {Error} If configuration is invalid or starting fails
   */
  async start(config) {
    try {
      if (!config || !config.baseUrl || !config.jwt || !config.userId) {
        console.error('Invalid metrics configuration:', config);
        throw new Error('Invalid metrics configuration');
      }

      // Stop any existing polling
      this.stop();
      
      this.config = config;

      // Check if we need to register the device or if deviceId is already provided
      if (!config.deviceId) {
        this.config.deviceId = await this.registerDevice(
          config.baseUrl, config.jwt, config.userId
        );
      }

      console.log('Starting metrics collection for device:', this.config.deviceId);
      
      // Send initial metrics
      this.sendBatchMetrics();
      
      // Setup polling interval
      this.pollingInterval = setInterval(
        () => this.sendBatchMetrics(),
        30000
      );
    } catch (err) {
      console.error('Failed to start metrics collection:', err);
      this.stop();
      throw err;
    }
  }

  /**
   * Stops metrics collection
   * Clears the polling interval and resets configuration
   */
  stop() {
    if (this.pollingInterval) {
      console.log('Stopping metrics collection');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.config = null;
  }
}

// Export a singleton instance of the MetricsPoller
module.exports = new MetricsPoller();
