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
    batteryPercentage: bi.percent,
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
    perCoreUsageJson: JSON.stringify(load.cpus.map((c,i) => ({
      core: i+1,
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
    totalMemory: mem.total / 1024 / 1024 / 1024,
    usedMemory: mem.used / 1024 / 1024 / 1024,
    availableMemory: mem.available / 1024 / 1024 / 1024,
    user: { id: userId },
    device: { deviceId }
  };
  await client.post('/api/metrics/ram-usage', payload);
}

async function sendDiskIO(client, userId, deviceId) {
  const dio = await si.disksIO();
  const payload = {
    readSpeedMBps: dio.rIO_sec  ? dio.rIO_sec  / 1024 : null,
    writeSpeedMBps: dio.wIO_sec ? dio.wIO_sec / 1024 : null,
    user: { id: userId },
    device: { deviceId }
  };
  await client.post('/api/metrics/disk-io', payload);
}

async function sendDiskUsage(client, userId, deviceId) {
  const fsArr = await si.fsSize();
  // pick first mount, or you can iterate if you prefer
  const d = fsArr[0] || {};
  const payload = {
    filesystem:    d.fs,
    sizeGB:        d.size      / 1024 / 1024 / 1024,
    usedGB:        d.used      / 1024 / 1024 / 1024,
    availableGB:   d.available / 1024 / 1024 / 1024,
    user:     { id: userId },
    device:   { deviceId }
  };
  await client.post('/api/metrics/disk-usage', payload);
}

async function sendNetworkInterfaces(client, userId, deviceId) {
  const ifaces = await si.networkInterfaces();
  // send one at a time (you could also send the array)
  for (const i of ifaces) {
    const payload = {
      iface:     i.iface,
      ipAddress: i.ip4,
      macAddress:i.mac,
      speedMbps: i.speed,
      user:    { id: userId },
      device:  { deviceId }
    };
    await client.post('/api/metrics/network-interfaces', payload);
  }
}

async function sendProcessStatus(client, userId, deviceId) {
  const procs = await si.processes();
  // take top 20 by cpu
  const top = procs.list
    .sort((a,b) => b.cpu - a.cpu)
    .slice(0,20)
    .map(p => ({
      pid:      p.pid,
      name:     p.name,
      cpuUsage: p.cpu,
      memoryMB: p.mem / 1024 / 1024,
      user:    { id: userId },
      device:  { deviceId }
    }));
  await client.post('/api/metrics/process-status', top);
}

async function collectAndSendAll(client, userId, deviceId) {
  try {
    await sendBatteryInfo(client, userId, deviceId);
    await sendCpuUsage(client, userId, deviceId);
    await sendRamUsage(client, userId, deviceId);
    await sendDiskIO(client, userId, deviceId);
    await sendDiskUsage(client, userId, deviceId);
    await sendNetworkInterfaces(client, userId, deviceId);
    await sendProcessStatus(client, userId, deviceId);
    console.log('Metrics batch sent successfully.');
  } catch (e) {
    console.error('Error sending metrics batch:', e.message);
  }
}

/**
 * Starts polling all metrics every `intervalMs` milliseconds.
 * Returns a `stop()` function which you can call to end the polling.
 */
function startMetricsPolling({ baseUrl, jwt, userId, deviceId, intervalMs = 30_000 }) {
  const client = createClient(baseUrl, jwt);

  // send immediately once…
  collectAndSendAll(client, userId, deviceId);

  // …then every intervalMs
  const handle = setInterval(() => {
    collectAndSendAll(client, userId, deviceId);
  }, intervalMs);

  return () => clearInterval(handle);
}

module.exports = { startMetricsPolling }; 