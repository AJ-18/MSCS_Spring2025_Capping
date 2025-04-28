const si = require('systeminformation');
const axios = require('axios');

class MetricsPoller {
    constructor() {
        this.pollingInterval = null;
        this.config = null;
    }

    async collectSystemMetrics() {
        try {
            // Collect all metrics in parallel
            const [
                battery,
                currentLoad,
                mem,
                fsSize,
                diskIOMetrics,
                processes
            ] = await Promise.all([
                si.battery(),
                si.currentLoad(),
                si.mem(),
                si.fsSize(),
                si.disksIO(),
                si.processes()
            ]);

            // Format battery info
            const batteryInfo = {
                hasBattery: battery.hasBattery,
                batteryPercentage: battery.percent,
                isCharging: battery.isCharging,
                powerConsumption: battery.powerConsumption || 0
            };

            // Format CPU usage
            const perCoreUsage = currentLoad.cpus.map((core, index) => ({
                core: index + 1,
                usage: core.load
            }));

            const cpuUsage = {
                totalCpuLoad: currentLoad.currentLoad,
                perCoreUsageJson: JSON.stringify(perCoreUsage)
            };

            // Format RAM usage (convert to GB)
            const ramUsage = {
                totalMemory: mem.total / (1024 * 1024 * 1024),
                usedMemory: mem.used / (1024 * 1024 * 1024),
                availableMemory: mem.available / (1024 * 1024 * 1024)
            };

            // Format Disk I/O
            const diskIO = {
                readSpeedMBps: diskIOMetrics.rIO_sec / 1024 / 1024,
                writeSpeedMBps: diskIOMetrics.wIO_sec / 1024 / 1024
            };

            // Format Disk Usage
            const mainDisk = fsSize[0]; // Using first disk
            const diskUsage = {
                filesystem: mainDisk.fs,
                sizeGB: mainDisk.size / (1024 * 1024 * 1024),
                usedGB: mainDisk.used / (1024 * 1024 * 1024),
                availableGB: mainDisk.available / (1024 * 1024 * 1024)
            };

            // Format Process Status (top 10 processes by CPU usage)
            const processStatuses = processes.list
                .sort((a, b) => b.cpu - a.cpu)
                .slice(0, 10)
                .map(proc => ({
                    pid: proc.pid,
                    name: proc.name,
                    cpuUsage: proc.cpu,
                    memoryMB: proc.memRss / 1024 / 1024
                }));

            return {
                userId: this.config.userId,
                deviceId: this.config.deviceId,
                batteryInfo,
                cpuUsage,
                ramUsage,
                diskIO,
                diskUsage,
                processStatuses
            };
        } catch (error) {
            console.error('Error collecting metrics:', error);
            throw error;
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

            return {
                deviceName: system.model,
                manufacturer: system.manufacturer,
                model: system.model,
                processor: `${cpu.manufacturer} ${cpu.brand} ${cpu.speed} GHz`,
                cpuPhysicalCores: cpu.physicalCores,
                cpuLogicalCores: cpu.cores,
                installedRam: (await si.mem()).total / (1024 * 1024 * 1024),
                graphics: graphics.controllers[0]?.model || 'N/A',
                operatingSystem: `${os.distro} ${os.arch}`,
                systemType: `${os.arch} operating system, ${cpu.manufacturer}-based processor`
            };
        } catch (error) {
            console.error('Error collecting device info:', error);
            throw error;
        }
    }

    async registerDevice(baseUrl, token, userId) {
        try {
            const deviceInfo = await this.collectDeviceInfo();
            const response = await axios.post(
                `${baseUrl}/api/users/${userId}/devices`,
                {
                    ...deviceInfo,
                    user: { id: userId }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.deviceId;
        } catch (error) {
            console.error('Error registering device:', error);
            throw error;
        }
    }

    async sendBatchMetrics() {
        try {
            const metrics = await this.collectSystemMetrics();
            await axios.post(
                `${this.config.baseUrl}/api/metrics/batch`,
                metrics,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.jwt}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error('Error sending batch metrics:', error);
        }
    }

    start(config) {
        this.config = config;
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        // Send metrics immediately and then every 5 seconds
        this.sendBatchMetrics();
        this.pollingInterval = setInterval(() => {
            this.sendBatchMetrics();
        }, 5000);
    }

    stop() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.config = null;
    }
}

module.exports = new MetricsPoller(); 