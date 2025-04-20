import React, { useState, useEffect } from 'react';
import MetricGauge from './MetricGauge';
import ProcessTable from './ProcessTable';
import { mockSystemMetrics } from '../mocks/systemMetrics.mock';
import { fetchSystemMetrics } from '../services/systemMetrics';

// Sample metrics data structure for CPU, Memory, and Disk
const systemMetrics = {
  cpu: {
    usage: 67,        // CPU usage percentage
    color: '#36B5C5'  // Color for CPU gauge
  },
  memory: {
    used: 1.65,       // GB of RAM used
    total: 1.75,      // Total GB of RAM
    color: '#2A9D8F'  // Color for memory gauge
  },
  disk: {
    used: 9.67,       // GB of disk used
    total: 20,        // Total GB of disk space
    color: '#E63946'  // Color for disk gauge
  }
};

// Sample process data for the process table
const processData = [
  // Each process has PID, name, CPU usage, memory usage, and runtime
  { pid: 1, name: 'ROOT', cpu: 14, memory: 0.25, time: '0:13:34' },
  { pid: 2, name: 'CHROME', cpu: 34, memory: 0.50, time: '0:19:15' },
  { pid: 3, name: 'XLR', cpu: 2, memory: 0.20, time: '0:03:29' },
  { pid: 4, name: 'SPOTIFY', cpu: 5, memory: 0.35, time: '1:22:45' },
];

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define gauge colors
  const gaugeColors = {
    cpu: '#FF6B6B',     // Red
    memory: '#4ECDC4',  // Teal
    disk: '#45B7D1'     // Blue
  };

  useEffect(() => {
    let mounted = true;

    const loadMetrics = async () => {
      try {
        const data = await fetchSystemMetrics();
        if (mounted) {
          setMetrics(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching metrics:', err);
          setError('Error loading system metrics');
          setMetrics(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMetrics();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!metrics) return null;

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
            value={metrics.cpu.usage} 
            color={gaugeColors.cpu}
            suffix="%" 
          />
          <MetricGauge 
            title="Memory" 
            value={(metrics.memory.used / metrics.memory.total) * 100} 
            color={gaugeColors.memory}
            subtitle={`${Math.round(metrics.memory.used/1024)}/${Math.round(metrics.memory.total/1024)} GB`} 
          />
          <MetricGauge 
            title="Disk" 
            value={(metrics.disk.used / metrics.disk.total) * 100} 
            color={gaugeColors.disk}
            subtitle={`${Math.round(metrics.disk.used/1024)}/${Math.round(metrics.disk.total/1024)} GB`} 
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