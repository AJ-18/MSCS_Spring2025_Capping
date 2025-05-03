/**
 * Electron Preload Script
 * 
 * This script runs in a privileged environment with access to both Node.js APIs
 * and the DOM. It serves as a secure bridge between the renderer process and
 * the main process, exposing only specific IPC functionality to the web content.
 * 
 * It uses contextBridge to expose a controlled API that can be used by the renderer
 * without giving it full access to Node.js or IPC directly, maintaining security.
 */

// Import required Electron modules
const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose a 'metrics' object to the renderer process via contextBridge
 * This creates a secure interface for the renderer to access specific IPC functions
 * without having direct access to the entire IPC system
 */
contextBridge.exposeInMainWorld('metrics', {
  /**
   * Register the current device with the backend
   * 
   * @param {string} baseUrl - The base URL of the backend API
   * @param {string} token - Authentication token for the API
   * @param {string} userId - User ID to associate with the device
   * @returns {Promise<string>} - Promise resolving to the device ID
   */
  registerDevice: (baseUrl, token, userId) =>
    ipcRenderer.invoke('register-device', baseUrl, token, userId),
  
  /**
   * Start metrics collection
   * Initiates the metrics collection process with the provided configuration
   * 
   * @param {Object} config - Configuration object for metrics collection
   * @param {string} config.baseUrl - API base URL
   * @param {string} config.jwt - Authentication token
   * @param {string} config.userId - User ID
   * @param {string} [config.deviceId] - Device ID (optional)
   * @returns {Promise<boolean>} - Promise resolving to success status
   */
  start: (config) =>
    ipcRenderer.invoke('start-metrics', config),
  
  /**
   * Stop metrics collection
   * Terminates the metrics collection process
   * 
   * @returns {Promise<boolean>} - Promise resolving to success status
   */
  stop: () =>
    ipcRenderer.invoke('stop-metrics'),
  
  /**
   * Get device information
   * Retrieves hardware and system details about the current device
   * 
   * @returns {Promise<Object>} - Promise resolving to device information object
   */
  getDeviceInfo: () =>
    ipcRenderer.invoke('get-device-info')
});
