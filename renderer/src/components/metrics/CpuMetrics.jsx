import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetricGauge from '../MetricGauge';

// Mock data for development
const MOCK_CPU_INFO = {
  totalCpuLoad: 55.5,
  perCoreUsageJson: JSON.stringify([
    { core: 1, usage: 60.5 },
    { core: 2, usage: 45.2 },
    { core: 3, usage: 52.8 },
    { core: 4, usage: 48.7 },
    { core: 5, usage: 55.3 },
    { core: 6, usage: 42.1 },
    { core: 7, usage: 58.9 },
    { core: 8, usage: 51.4 }
  ]),
  timestamp: new Date().toISOString()
};

const CpuMetrics = () => {
  const { deviceId } = useParams();
  const [cpuInfo, setCpuInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCpuInfo = async () => {
      try {
        // In development mode, use mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock CPU metrics in development mode');
          setCpuInfo({
            ...MOCK_CPU_INFO,
            perCoreUsage: JSON.parse(MOCK_CPU_INFO.perCoreUsageJson),
            timestamp: new Date().toISOString()
          });
          setError(null);
          return;
        }

        // Production mode - real API call
        const userId = localStorage.getItem('userId');
        if (!userId || !deviceId) {
          throw new Error('Missing user ID or device ID');
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/metrics/cpu-usage/${userId}/${deviceId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCpuInfo({
          totalCpuLoad: data.totalCpuLoad,
          perCoreUsage: JSON.parse(data.perCoreUsageJson || '[]'),
          timestamp: new Date().toISOString()
        });
        setError(null);
      } catch (error) {
        console.error('Error loading CPU metrics:', error);
        if (process.env.NODE_ENV === 'development') {
          // In development, fall back to mock data on error
          console.log('Falling back to mock data due to error');
          setCpuInfo({
            ...MOCK_CPU_INFO,
            perCoreUsage: JSON.parse(MOCK_CPU_INFO.perCoreUsageJson),
            timestamp: new Date().toISOString()
          });
          setError(null);
        } else {
          setError(`Failed to load CPU information: ${error.message}`);
          setCpuInfo(null);
        }
      }
    };

    loadCpuInfo();
    const interval = setInterval(loadCpuInfo, 5000);

    return () => clearInterval(interval);
  }, [deviceId]);

  if (error) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <Link
            to={`/dashboard/device/${deviceId}`}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Device Overview
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">CPU Metrics</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!cpuInfo) {
    return <div className="p-4">Loading CPU information...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Link
          to={`/dashboard/device/${deviceId}`}
          className="text-blue-500 hover:text-blue-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Device Overview
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">CPU Metrics</h2>

        {/* Total CPU Load with Gauge */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <MetricGauge
              title="Total CPU Load"
              value={cpuInfo.totalCpuLoad}
              color={
                cpuInfo.totalCpuLoad > 90 ? '#EF4444' :  // red-500
                cpuInfo.totalCpuLoad > 70 ? '#F59E0B' :  // yellow-500
                '#10B981'  // green-500
              }
              suffix="%"
            />
          </div>
        </div>

        {/* Per Core Usage */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Per Core Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cpuInfo.perCoreUsage.map((core) => (
              <div key={core.core} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Core {core.core}</span>
                  <span className="font-medium">{core.usage.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                      core.usage > 90 ? 'bg-red-500' : 
                      core.usage > 70 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${core.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-right">
          Last updated: {new Date(cpuInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CpuMetrics; 