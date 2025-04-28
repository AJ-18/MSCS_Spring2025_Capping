// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('metrics', {
  registerDevice: (baseUrl, token, userId) =>
    ipcRenderer.invoke('register-device', baseUrl, token, userId),
  start: (config) =>
    ipcRenderer.invoke('start-metrics', config),
  stop: () =>
    ipcRenderer.invoke('stop-metrics')
});
