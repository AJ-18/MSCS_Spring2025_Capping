import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DeviceInfoCard from './DeviceInfoCard';
import { fetchSystemMetrics } from '../services/systemMetrics';

const MetricCard = ({ title, icon, value, unit, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-gray-700 text-lg">{title}</h3>
      <span className="text-gray-500">{icon}</span>
    </div>
    <div className="flex items-baseline">
      <span className="text-4xl font-semibold text-gray-900">{value}</span>
      <span className="text-gray-500 text-sm ml-1">{unit}</span>
    </div>
  </div>
);

const DeviceDetails = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        const metrics = await fetchSystemMetrics();
        setDeviceInfo({
          deviceName: metrics.deviceName || 'MyComputer',
          manufacturer: metrics.manufacturer || 'Dell',
          model: metrics.model || 'Inspiron 15',
          processor: metrics.cpu?.model || 'Intel Core i7 2.8 GHz',
          physicalCores: metrics.cpu?.physicalCores || 4,
          logicalCores: metrics.cpu?.logicalCores || 8,
          ram: (metrics.memory?.total / 1024 / 1024 / 1024).toFixed(1) || '16.0',
          graphics: metrics.graphics?.model || 'NVIDIA GTX 1650',
          os: metrics.os?.name || 'Windows 10 x64',
          systemType: metrics.os?.arch || 'x64-based processor',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error loading device info:', error);
      }
    };

    loadDeviceInfo();
    const interval = setInterval(loadDeviceInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [deviceId]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchSystemMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      title: 'CPU Usage',
      icon: '📊',
      value: metrics?.cpu?.usage || 52,
      unit: '%',
      path: 'cpu'
    },
    {
      title: 'Memory',
      icon: '💾',
      value: metrics?.memory?.used ? Math.round(metrics.memory.used / 1024) : 7,
      unit: 'GB',
      path: 'memory'
    },
    {
      title: 'Disk Usage',
      icon: '💿',
      value: metrics?.disk?.used ? Math.round((metrics.disk.used / metrics.disk.total) * 100) : 53,
      unit: '%',
      path: 'disk'
    },
    {
      title: 'Battery',
      icon: '🔋',
      value: '100',
      unit: '%',
      path: 'battery'
    },
    {
      title: 'Processes',
      icon: '⚙️',
      value: '42',
      unit: 'active',
      path: 'processes'
    }
  ];

  if (!deviceInfo) {
    return <div className="p-4">Loading device information...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-600 text-sm">
            ← Back to Devices
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Device Overview</h1>
        </div>

        <div className="mb-8">
          <DeviceInfoCard deviceInfo={deviceInfo} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {metricCards.map((card) => (
            <MetricCard
              key={card.title}
              {...card}
              onClick={() => navigate(`/dashboard/device/${deviceId}/${card.path}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails; 