import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DeviceList = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const currentDeviceId = localStorage.getItem('deviceId');

  useEffect(() => {
    // For now, we'll just show the current device
    // In a real app, this would fetch from an API
    setDevices([
      {
        id: currentDeviceId,
        name: 'MyComputer',
        type: 'Desktop',
        lastSeen: new Date().toISOString(),
        status: 'Online'
      }
    ]);
  }, [currentDeviceId]);

  const handleDeviceSelect = (deviceId) => {
    localStorage.setItem('deviceId', deviceId);
    navigate(`/dashboard/device/${deviceId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Devices</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDeviceSelect(device.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{device.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                device.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {device.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Type: {device.type}</p>
              <p>Last Seen: {new Date(device.lastSeen).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList; 