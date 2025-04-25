import React, { useState, useEffect } from 'react';
import MetricGauge from './MetricGauge';
import ProcessTable from './ProcessTable';
import { fetchSystemMetrics } from '../services/systemMetrics';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define gauge colors
  const gaugeColors = {
    cpu: '#FF6B6B',     // Red
    memory: '#4ECDC4',  // Teal
    disk: '#45B7D1'     // Blue
  };

  const handleLogout = () => {
    // Clear all stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('deviceId');
    
    // The metrics polling will automatically stop when the token is removed
    // Navigate to login page
    navigate('/login');
  };

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const loadMetrics = async () => {
      try {
        const data = await fetchSystemMetrics();
        if (mounted) {
          setMetrics(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading metrics:', err);
          setError('Error loading system metrics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Load metrics immediately
    loadMetrics();

    // Then update every 5 seconds
    intervalId = setInterval(loadMetrics, 5000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
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
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
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
          <ProcessTable processes={[
            { pid: 1, name: 'System', cpu: Math.random() * 10, memory: 0.5, time: '1:30:00' },
            { pid: 2, name: 'User', cpu: Math.random() * 20, memory: 1.2, time: '0:45:30' },
            { pid: 3, name: 'Browser', cpu: Math.random() * 30, memory: 2.1, time: '2:15:45' },
          ]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;