// metrics-poller.js

const si       = require('systeminformation');
const psList   = require('@trufflesuite/ps-list');
const perfmon  = require('perfmon');
const { exec } = require('child_process');
const { promisify } = require('util');
const axios    = require('axios');

const execAsync = promisify(exec);

// ---- PerfMon counters for Disk I/O ----
const diskCounters = [
  '\\PhysicalDisk(_Total)\\Disk Read Bytes/sec',
  '\\PhysicalDisk(_Total)\\Disk Write Bytes/sec'
];

// start perfmon stream immediately
const diskIOStream = perfmon(diskCounters);
let latestDiskIO = { 
  [diskCounters[0]]: 0, 
  [diskCounters[1]]: 0 
};
diskIOStream.on('data', stat => { latestDiskIO = stat.counters; });
diskIOStream.on('error', err => { console.error('perfmon error:', err); });

// ---- Helper: WMI map of pid → WorkingSetSize ----
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

class MetricsPoller {
  constructor() {
    this.pollingInterval = null;
    this.config          = null;
  }

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

      const match = devices.find(d =>
        d.deviceName   === deviceInfo.deviceName &&
        d.manufacturer === deviceInfo.manufacturer &&
        d.model        === deviceInfo.model
      );

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

  async collectSystemMetrics() {
    if (!this.config) {
      console.error('Metrics collection attempted without configuration');
      return null;
    }

    // WMI memory map
    const wmiMemMap = await getWmiMemoryMap();

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

    // Processes
    const procs = await psList();
    const processStatuses = procs
      .sort((a,b) => (b.cpu||0)-(a.cpu||0))
      .slice(0,10)
      .map(p => ({
        pid:      p.pid,
        name:     p.name,
        cpuUsage: p.cpu || 0,
        memoryMB: (wmiMemMap[p.pid] || 0) / 1024**2
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

  stop() {
    if (this.pollingInterval) {
      console.log('Stopping metrics collection');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.config = null;
  }
}

module.exports = new MetricsPoller();
