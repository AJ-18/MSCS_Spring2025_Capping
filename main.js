const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const isDev = process.env.NODE_ENV !== 'production';
const si = require('systeminformation');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'renderer/build/index.html'));
  }
}

// Handle system metrics request
ipcMain.handle('get-system-metrics', async () => {
  try {
    const [cpu, mem, disk, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.processes()
    ]);

    return {
      cpu: {
        usage: Math.round(cpu.currentLoad),
        temperature: 0 // Available with si.cpuTemperature()
      },
      memory: {
        total: Math.round(mem.total / (1024 * 1024)),
        used: Math.round(mem.used / (1024 * 1024))
      },
      disk: {
        total: Math.round(disk[0].size / (1024 * 1024)),
        used: Math.round(disk[0].used / (1024 * 1024))
      },
      processes: processes.list.slice(0, 10).map(proc => ({
        pid: proc.pid,
        name: proc.name,
        cpu: proc.cpu,
        memory: Math.round(proc.memRss / (1024 * 1024))
      }))
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    throw error;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});