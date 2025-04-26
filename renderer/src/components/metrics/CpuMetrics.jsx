import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSystemMetrics } from '../../services/systemMetrics';
import MetricGauge from '../MetricGauge';

const CpuMetrics = () => {
  const { deviceId } = useParams();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchSystemMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading CPU metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/dashboard/device/${deviceId}`}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Device Overview
          </Link>
          <h2 className="text-2xl font-bold mt-2">CPU Performance</h2>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main CPU Usage Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <MetricGauge
            title="Total CPU Usage"
            value={metrics.cpu.usage}
            color="#3B82F6"
            suffix="%"
            subtitle="System Load Average"
          />
        </div>

        {/* CPU Temperature */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <MetricGauge
            title="CPU Temperature"
            value={(metrics.cpu.temperature / 100) * 100}
            color="#EF4444"
            suffix="°C"
            subtitle="Current Temperature"
          />
        </div>

        {/* Core Usage Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Individual Core Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.cpu.cores.map((core, index) => (
              <div key={index} className="transform scale-75">
                <MetricGauge
                  title={`Core ${index + 1}`}
                  value={core.load}
                  color="#8B5CF6"
                  suffix="%"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CPU Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">CPU Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium mt-1">Intel Core i7 2.8 GHz</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Architecture</p>
              <p className="font-medium mt-1">x64</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Physical Cores</p>
              <p className="font-medium mt-1">4</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Logical Cores</p>
              <p className="font-medium mt-1">8</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpuMetrics; 