// Mock system metrics data
export const mockSystemMetrics = {
  cpu: {
    usage: 67,
    color: '#36B5C5'
  },
  memory: {
    used: 1.65,
    total: 1.75,
    color: '#2A9D8F'
  },
  disk: {
    used: 9.67,
    total: 20,
    color: '#E63946'
  },
  processes: [
    {
      pid: 1234,
      name: "chrome.exe",
      cpu: 14,
      memory: 0.25,
      time: "0:13:34"
    },
    {
      pid: 5678,
      name: "discord.exe",
      cpu: 4.2,
      memory: 0.45,
      time: "0:19:15"
    }
  ]
};
