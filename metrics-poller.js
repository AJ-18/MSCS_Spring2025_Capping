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
diskIOStream.on('data', stat => {
  latestDiskIO = stat.counters;
});
diskIOStream.on('error', err => {
  console.error('perfmon error:', err);
});

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
    const [system, cpu, graphics, os, mem] = await Promise.all([
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
    const deviceInfo = await this.collectDeviceInfo();
    const res = await axios.post(
      `${baseUrl}/api/users/${userId}/devices`,
      deviceInfo,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Spring returns an array of devices
    const devices = Array.isArray(res.data) ? res.data : [];
    if (!devices.length) {
      throw new Error('No devices returned from registration');
    }
    // find exact match or take last
    const match = devices.find(d =>
      d.deviceName   === deviceInfo.deviceName &&
      d.manufacturer === deviceInfo.manufacturer &&
      d.model        === deviceInfo.model
    );
    return (match || devices[devices.length - 1]).deviceId;
  }

  async collectSystemMetrics() {
    // 1) get WMI memory map
    const wmiMemMap = await getWmiMemoryMap();

    // 2) gather SI metrics
    const [ battery, load, mem, fsList ] = await Promise.all([
      si.battery(),
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    // 3) build batteryInfo
    const batteryInfo = {
      hasBattery:      battery.hasBattery,
      batteryPercentage: battery.percent,
      isCharging:      battery.isCharging,
      powerConsumption: battery.powerConsumption || 0
    };

    // 4) build cpuUsage (and JSON stringify per-core)
    const perCore = load.cpus.map((c,i) => ({ core:i+1, usage:c.load }));
    const cpuUsage = {
      totalCpuLoad:       load.currentLoad,
      perCoreUsageJson:   JSON.stringify(perCore)
    };

    // 5) build ramUsage
    const ramUsage = {
      totalMemory:     mem.total / 1024**3,
      usedMemory:      mem.used  / 1024**3,
      availableMemory: mem.available / 1024**3
    };

    // 6) build diskUsage from first FS
    const fs0 = fsList[0] || { fs:'N/A', size:0, used:0, available:0 };
    const diskUsage = {
      filesystem: fs0.fs,
      sizeGB:     fs0.size      / 1024**3,
      usedGB:     fs0.used      / 1024**3,
      availableGB:fs0.available / 1024**3
    };

    // 7) diskIO via perfmon counters → to KB/s
    const readBps  = latestDiskIO[diskCounters[0]] || 0;
    const writeBps = latestDiskIO[diskCounters[1]] || 0;
    const diskIO = {
      readSpeedMBps:  readBps  / 1024**2,
      writeSpeedMBps: writeBps / 1024**2
    };

    // 8) processes via ps-list + WMI
    const allProcs = await psList();
    const top = allProcs
      .sort((a,b) => (b.cpu||0) - (a.cpu||0))
      .slice(0, 10)
      .map(p => ({
        pid:       p.pid,
        name:      p.name,
        cpuUsage:  p.cpu || 0,
        memoryMB:  (wmiMemMap[p.pid] || 0) / 1024**2
      }));

    return {
      userId:          this.config.userId,
      deviceId:        this.config.deviceId,
      batteryInfo,
      cpuUsage,
      ramUsage,
      diskIO,
      diskUsage,
      processStatuses: top
    };
  }

  async sendBatchMetrics() {
    try {
      const payload = await this.collectSystemMetrics();
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
    this.config = config;
    // 1) register device first
    this.config.deviceId = await this.registerDevice(
      config.baseUrl,
      config.jwt,
      config.userId
    );
    // 2) then fire & schedule metrics
    this.sendBatchMetrics();
    this.pollingInterval = setInterval(
      () => this.sendBatchMetrics(),
      5000
    );
  }

  stop() {
    clearInterval(this.pollingInterval);
    this.config = null;
  }
}

module.exports = new MetricsPoller();
