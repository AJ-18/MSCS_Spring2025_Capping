// metrics-poller.js
const si = require('systeminformation');
const axios = require('axios');

class MetricsPoller {
  constructor() {
    this.pollingInterval = null;
    this.config = null;
  }

  async collectSystemMetrics() {
    try {
      // disksIO can sometimes return null or throw—catch and default to zeros
      const rawDiskIO = await si.disksIO().catch(() => null);

      // fsSize may be empty—handle below
      const [
        battery,
        currentLoad,
        mem,
        fsSize,
        processes
      ] = await Promise.all([
        si.battery(),
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.processes()
      ]);

      // Battery
      const batteryInfo = {
        hasBattery: battery.hasBattery,
        batteryPercentage: battery.percent,
        isCharging: battery.isCharging,
        powerConsumption: battery.powerConsumption || 0
      };

      // CPU
      const perCoreUsage = currentLoad.cpus.map((core, idx) => ({
        core: idx + 1,
        usage: core.load
      }));
      const cpuUsage = {
        totalCpuLoad: currentLoad.currentLoad,
        perCoreUsage
      };

      // RAM (GB)
      const ramUsage = {
        totalMemory: mem.total / 2 ** 30,
        usedMemory: mem.used / 2 ** 30,
        availableMemory: mem.available / 2 ** 30
      };

      // Disk I/O (MB/s), default to zero if rawDiskIO is null
      const diskIOMetrics = rawDiskIO || { rIO_sec: 0, wIO_sec: 0 };
      const diskIO = {
        readSpeedMBps: diskIOMetrics.rIO_sec / 2 ** 20,
        writeSpeedMBps: diskIOMetrics.wIO_sec / 2 ** 20
      };

      // Primary filesystem (guard if fsSize array is empty)
      const mainFs = Array.isArray(fsSize) && fsSize.length > 0
        ? fsSize[0]
        : { fs: 'N/A', size: 0, used: 0, available: 0 };
      const mainDisk = {
        filesystem:  mainFs.fs,
        sizeGB:      mainFs.size      / 2 ** 30,
        usedGB:      mainFs.used      / 2 ** 30,
        availableGB: mainFs.available / 2 ** 30
      };

      // Top 10 processes by CPU
      const processStatuses = processes.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 10)
        .map(p => ({
          pid:       p.pid,
          name:      p.name,
          cpuUsage:  p.cpu,
          memoryMB:  p.memRss / 2 ** 20
        }));

      return {
        userId:       this.config.userId,
        deviceId:     this.config.deviceId,
        batteryInfo,
        cpuUsage,
        ramUsage,
        diskIO,
        mainDisk,
        processStatuses
      };
    } catch (err) {
      console.error('Error collecting metrics:', err);
      throw err;
    }
  }

  async collectDeviceInfo() {
    try {
      const [system, cpu, graphics, os] = await Promise.all([
        si.system(),
        si.cpu(),
        si.graphics(),
        si.osInfo()
      ]);
      const mem = await si.mem();

      return {
        deviceName:      system.model,
        manufacturer:    system.manufacturer,
        model:           system.model,
        processor:       `${cpu.manufacturer} ${cpu.brand} ${cpu.speed} GHz`,
        cpuPhysicalCores: cpu.physicalCores,
        cpuLogicalCores:  cpu.cores,
        installedRam:     mem.total / 2 ** 30,
        graphics:         graphics.controllers[0]?.model || 'N/A',
        operatingSystem:  `${os.distro} ${os.arch}`,
        systemType:       `${os.arch} OS, ${cpu.manufacturer}-based CPU`
      };
    } catch (err) {
      console.error('Error collecting device info:', err);
      throw err;
    }
  }

  async registerDevice(baseUrl, token, userId) {
    try {
      const deviceInfo = await this.collectDeviceInfo();
      const res = await axios.post(
        `${baseUrl}/api/users/${userId}/devices`,
        deviceInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const devices = res.data;
      if (!Array.isArray(devices) || devices.length === 0) {
        throw new Error('No devices returned');
      }

      const match = devices.find(d =>
        d.deviceName   === deviceInfo.deviceName &&
        d.manufacturer === deviceInfo.manufacturer &&
        d.model        === deviceInfo.model
      );
      return (match || devices[devices.length - 1]).deviceId;
    } catch (err) {
      console.error('Error registering device:', err);
      throw err;
    }
  }

  async sendBatchMetrics() {
    try {
      const metrics = await this.collectSystemMetrics();
      await axios.post(
        `${this.config.baseUrl}/api/metrics/batch`,
        metrics,
        { headers: { Authorization: `Bearer ${this.config.jwt}` } }
      );
    } catch (err) {
      console.error('Error sending batch metrics:', err);
    }
  }

  start(config) {
    this.config = config;
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.sendBatchMetrics();  // immediate
    this.pollingInterval = setInterval(
      () => this.sendBatchMetrics(),
      5000
    );
  }

  stop() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = null;
    this.config = null;
  }
}

module.exports = new MetricsPoller();
