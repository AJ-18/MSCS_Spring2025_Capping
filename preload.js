const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Add any functions you want to expose to your React app here
}); 