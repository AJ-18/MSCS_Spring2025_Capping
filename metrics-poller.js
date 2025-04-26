const si = require('systeminformation');
const axios = require('axios');

function createClient(baseUrl, jwt) {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    timeout: 10_000
  });
}

async function sendBatteryInfo(client, userId, deviceId) {
  const bi = await si.battery();
  const payload = {
    hasBattery: bi.hasBattery,
    batteryPercentage: bi.percent || 0,
    isCharging: bi.isCharging,
    powerConsumption: bi.powerConsumption ?? null,
    user: { id: userId },
    device: { deviceId }
  };
  await client.post('/api/metrics/battery-info', payload);
}

async function sendCpuUsage(client, userId, deviceId) {
  const load = await si.currentLoad();
  const payload = {
    totalCpuLoad: load.currentLoad,
    perCoreUsageJson: JSON.stringify(load.cpus.map((c, i) => ({
      core: i + 1,
      usage: c.load
    }))),
    user: { id: userId },
    device: { deviceId }
  };
  await client.post('/api/metrics/cpu-usage', payload);
}

async function sendRamUsage(client, userId, deviceId) {
  const mem = await si.mem();
  const payload = {
    totalMemory: mem.total / 1024 / 1024 / 1024,    // Convert to GB
    usedMemory: mem.used / 1024 / 1024 / 1024,      // Convert to GB
    availableMemory: mem.available / 1024 / 1024 / 1024, // Convert to GB
    user: { id: userId },
    device: { deviceId }
  };
  await client.post('/api/metrics/ram-usage', payload);
}

async function sendDiskIO(client, userId, deviceId) {
  const dio = await si.disksIO();
  const payload = {
    readSpeedMBps: dio.rIO_sec ? dio.rIO_sec / 1024 / 1024 : 0,  // Convert to MB/s
    writeSpeedMBps: dio.wIO_sec ? dio.wIO_sec / 1024 / 1024 : 0, // Convert to MB/s
    user: { id: userId },
    device: { deviceId }
  };
  await client.post('/api/metrics/disk-io', payload);
}

async function sendDiskUsage(client, userId, deviceId) {
  const fsArr = await si.fsSize();
  const d = fsArr[0] || {};
  const payload = {
    filesystem: d.fs || 'unknown',
    sizeGB: d.size / 1024 / 1024 / 1024,      // Convert to GB
    usedGB: d.used / 1024 / 1024 / 1024,      // Convert to GB
    availableGB: d.available / 1024 / 1024 / 1024, // Convert to GB
    user: { id: userId },
    device: { deviceId }
  };
  await client.post('/api/metrics/disk-usage', payload);
}

async function sendProcessStatus(client, userId, deviceId) {
  const procs = await si.processes();
  // Take top 20 processes by CPU usage
  const processPayloads = procs.list
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 20)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      cpuUsage: p.cpu,
      memoryMB: p.mem / 1024 / 1024, // Convert to MB
      user: { id: userId },
      device: { deviceId }
    }));

  // Send all process statuses in a single request
  await client.post('/api/metrics/process-status', processPayloads);
}

async function collectAndSendAll(client, userId, deviceId) {
  try {
    await Promise.all([
      sendBatteryInfo(client, userId, deviceId),
      sendCpuUsage(client, userId, deviceId),
      sendRamUsage(client, userId, deviceId),
      sendDiskIO(client, userId, deviceId),
      sendDiskUsage(client, userId, deviceId),
      sendProcessStatus(client, userId, deviceId)
    ]);
    console.log('Metrics batch sent successfully.');
  } catch (e) {
    console.error('Error sending metrics batch:', e.message);
  }
}

/**
 * Starts polling all metrics every `intervalMs` milliseconds.
 * Returns a `stop()` function which you can call to end the polling.
 */
function startMetricsPolling({ baseUrl, jwt, userId, deviceId, intervalMs = 5000 }) {
  const client = createClient(baseUrl, jwt);

  // Send immediately once
  collectAndSendAll(client, userId, deviceId);

  // Then every intervalMs
  const handle = setInterval(() => {
    collectAndSendAll(client, userId, deviceId);
  }, intervalMs);

  return () => clearInterval(handle);
}

module.exports = { startMetricsPolling }; 