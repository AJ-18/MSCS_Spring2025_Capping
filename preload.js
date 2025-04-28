const { contextBridge, ipcRenderer } = require('electron');
const metricsPoller = require('./metrics-poller');

contextBridge.exposeInMainWorld('electron', {
  // Add any functions you want to expose to your React app here
});

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics')
});

// Expose protected methods that allow the renderer process to use
// the metrics poller via a 'metrics' global variable
contextBridge.exposeInMainWorld(
  'metrics',
  {
    // Register device and get deviceId
    registerDevice: (baseUrl, token, userId) => {
      return metricsPoller.registerDevice(baseUrl, token, userId);
    },
    
    // Start metrics polling
    start: (config) => {
      metricsPoller.start(config);
    },
    
    // Stop metrics polling
    stop: () => {
      metricsPoller.stop();
    }
  }
); 