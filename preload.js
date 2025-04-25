const { contextBridge, ipcRenderer } = require('electron');
const { startMetricsPolling } = require('./metrics-poller');

contextBridge.exposeInMainWorld('electron', {
  // Add any functions you want to expose to your React app here
});

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics')
});

contextBridge.exposeInMainWorld('metrics', {
  start: startMetricsPolling
}); 