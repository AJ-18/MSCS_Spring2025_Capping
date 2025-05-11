/**
 * Electron Main Process
 * 
 * This is the entry point for the Electron application. It handles window creation,
 * communication between main and renderer processes via IPC, and metrics collection.
 */

// Import required Electron modules
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

// Import metrics collection module
const metricsPoller = require('./metrics-poller');

/**
 * Creates the main application window
 * Sets up the window with secure configuration and loads the renderer content
 */
function createWindow() {
  // Create a new browser window with security-focused configuration
  const win = new BrowserWindow({
    width:  1200,
    height: 800,
    title: "S.P.A.R Metrics Collector",
    icon: path.join(__dirname, 'renderer/public/SPAR.png'),
    webPreferences: {
      nodeIntegration:        false,  // Prevents renderer from accessing Node directly
      contextIsolation:       true,   // Isolates preload script from renderer
      enableRemoteModule:     false,  // Disables remote module for security
      preload:                path.join(__dirname, 'preload.js'), // Loads the preload script
      webSecurity:            true,   // Enforces same-origin policy
      allowRunningInsecureContent: false // Prevents loading insecure resources
    }
  });

  // Remove the menu bar
  win.setMenu(null);

  // Load appropriate content based on environment
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'renderer/build/index.html'));
  }
}

/**
 * Application initialization
 * Creates the window and sets up IPC handlers when the app is ready
 */
app.whenReady().then(() => {
  // Remove application menu completely
  Menu.setApplicationMenu(null);
  
  createWindow();

  /**
   * IPC handler: get-device-info
   * Retrieves device information via the metrics poller
   * @returns {Promise<Object>} Device information
   */
  ipcMain.handle('get-device-info', async () => {
    try {
      return await metricsPoller.collectDeviceInfo();
    } catch (err) {
      console.error('get-device-info error:', err);
      throw err;
    }
  });

  /**
   * IPC handler: register-device
   * Registers the current device with the backend API
   * @param {Event} _ - Electron IPC event 
   * @param {string} baseUrl - API base URL
   * @param {string} token - Authentication token
   * @param {string} userId - User ID to associate with the device
   * @returns {Promise<string>} Registered device ID
   */
  ipcMain.handle('register-device', async (_, baseUrl, token, userId) => {
    try {
      return await metricsPoller.registerDevice(baseUrl, token, userId);
    } catch (err) {
      console.error('register-device error:', err);
      throw err;
    }
  });

  /**
   * IPC handler: start-metrics
   * Starts the metrics collection process
   * @param {Event} _ - Electron IPC event (unused)
   * @param {Object} config - Configuration for metrics collection
   * @returns {boolean} Success indicator
   */
  ipcMain.handle('start-metrics', (_, config) => {
    metricsPoller.start(config);
    return true;
  });

  /**
   * IPC handler: stop-metrics
   * Stops the metrics collection process
   * @returns {boolean} Success indicator
   */
  ipcMain.handle('stop-metrics', () => {
    metricsPoller.stop();
    return true;
  });
});

/**
 * Application close handler
 * Quits the application when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/**
 * macOS-specific activation handler
 * Creates a new window if none exists when the application is activated
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
