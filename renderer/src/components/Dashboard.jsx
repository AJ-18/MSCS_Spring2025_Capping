import React from 'react';
import MetricGauge from './MetricGauge';
import ProcessTable from './ProcessTable';

// Sample system metrics data
const systemMetrics = {
  cpu: {
    usage: 67,
    color: '#36B5C5'  // Light blue color
  },
  memory: {
    used: 1.65,
    total: 1.75,
    color: '#2A9D8F'  // Teal color
  },
  disk: {
    used: 9.67,
    total: 20,
    color: '#E63946'  // Red color
  }
};

// Sample process data
const processData = [
  { pid: 1, name: 'ROOT', cpu: 14, memory: 0.25, time: '0:13:34' },
  { pid: 2, name: 'CHROME', cpu: 34, memory: 0.50, time: '0:19:15' },
  { pid: 3, name: 'XLR', cpu: 2, memory: 0.20, time: '0:03:29' },
  { pid: 4, name: 'SPOTIFY', cpu: 5, memory: 0.35, time: '1:22:45' },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#F5F2F0] p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif">S.P.A.R</h1>
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <MetricGauge 
            title="CPU" 
            value={systemMetrics.cpu.usage} 
            color={systemMetrics.cpu.color}
            suffix="%" 
          />
          <MetricGauge 
            title="Memory" 
            value={(systemMetrics.memory.used / systemMetrics.memory.total) * 100} 
            color={systemMetrics.memory.color}
            subtitle={`${systemMetrics.memory.used}/${systemMetrics.memory.total} GB`} 
          />
          <MetricGauge 
            title="Disk" 
            value={(systemMetrics.disk.used / systemMetrics.disk.total) * 100} 
            color={systemMetrics.disk.color}
            subtitle={`${systemMetrics.disk.used}/${systemMetrics.disk.total} GB`} 
          />
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-medium mb-4">System Info</h2>
          <ProcessTable processes={processData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;