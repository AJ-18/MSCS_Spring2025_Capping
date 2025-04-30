// electron/main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Bring in your metrics logic here in the main process
const metricsPoller = require('./metrics-poller');

function createWindow() {
  const win = new BrowserWindow({
    width:  1200,
    height: 800,
    webPreferences: {
      nodeIntegration:        false,
      contextIsolation:       true,
      enableRemoteModule:     false,
      preload:                path.join(__dirname, 'preload.js'),
      webSecurity:            true,
      allowRunningInsecureContent: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'renderer/build/index.html'));
  }
}

// Register the window, then set up our IPC handlers
app.whenReady().then(() => {
  createWindow();

  // 0) get-device-info → calls metricsPoller.collectDeviceInfo()
  ipcMain.handle('get-device-info', async () => {
    try {
      return await metricsPoller.collectDeviceInfo();
    } catch (err) {
      console.error('get-device-info error:', err);
      throw err;
    }
  });

  // 1) register-device → calls metricsPoller.registerDevice(...)
  ipcMain.handle('register-device', async (_, baseUrl, token, userId) => {
    try {
      return await metricsPoller.registerDevice(baseUrl, token, userId);
    } catch (err) {
      console.error('register-device error:', err);
      throw err;
    }
  });

  // 2) start-metrics → calls metricsPoller.start(...)
  ipcMain.handle('start-metrics', (_, config) => {
    metricsPoller.start(config);
    return true;
  });

  // 3) stop-metrics → calls metricsPoller.stop()
  ipcMain.handle('stop-metrics', () => {
    metricsPoller.stop();
    return true;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
