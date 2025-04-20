// Mock system metrics data
export const mockSystemMetrics = {
  cpu: {
    usage: 67,
    temperature: 72
  },
  memory: {
    total: 16384,  // in MB
    used: 8192     // in MB
  },
  disk: {
    total: 512000, // in MB
    used: 128000   // in MB
  },
  processes: [
    { pid: 1, name: 'System', cpu: 0.5, memory: 1024, time: '0:13:34' },
    { pid: 2, name: 'Chrome', cpu: 2.5, memory: 2048, time: '0:19:15' }
  ]
};
