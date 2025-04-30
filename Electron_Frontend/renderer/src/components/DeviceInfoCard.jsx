import React from 'react';

const DeviceInfoCard = ({ deviceInfo }) => {
  // If deviceInfo is null or undefined, show loading state
  if (!deviceInfo) {
    return (
      <div className="bg-[#1a1f2e] text-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Device Info</h2>
        <div className="text-center py-4">
          <div className="animate-pulse text-gray-400">Loading device information...</div>
        </div>
      </div>
    );
  }

  // Create safe accessors for properties with defaults and type formatting
  const getDeviceValue = (property, defaultValue = 'Not available', formatter = null) => {
    let value = deviceInfo[property];
    
    if (value == null) {
      return defaultValue;
    }
    
    if (formatter && typeof formatter === 'function') {
      try {
        return formatter(value);
      } catch (error) {
        console.error(`Error formatting value for ${property}:`, error);
        return defaultValue;
      }
    }
    
    return value;
  };

  // Format functions
  const formatNumber = (value) => {
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toString();
    }
    return String(value);
  };

  const formatRam = (value) => {
    if (typeof value === 'number') return `${value.toFixed(1)} GB`;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? `${value} GB` : `${num.toFixed(1)} GB`;
    }
    return `${value} GB`;
  };

  const formatDate = (value) => {
    try {
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return new Date(value).toLocaleString();
    } catch (e) {
      return value;
    }
  };

  return (
    <div className="bg-[#1a1f2e] text-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Device Info</h2>
      
      <div className="space-y-3">
        <InfoRow label="Device Name" value={getDeviceValue('deviceName')} />
        <InfoRow label="Manufacturer" value={getDeviceValue('manufacturer')} />
        <InfoRow label="Model" value={getDeviceValue('model')} />
        <InfoRow label="Processor" value={getDeviceValue('processor')} />
        <InfoRow label="Physical Cores" value={getDeviceValue('physicalCores', '0', formatNumber)} />
        <InfoRow label="Logical Cores" value={getDeviceValue('logicalCores', '0', formatNumber)} />
        <InfoRow label="RAM" value={getDeviceValue('ram', '0', formatRam)} />
        <InfoRow label="Graphics" value={getDeviceValue('graphics')} />
        <InfoRow label="OS" value={getDeviceValue('os')} />
        <InfoRow label="System Type" value={getDeviceValue('systemType')} />
        <InfoRow label="Timestamp" value={getDeviceValue('timestamp', 'N/A', formatDate)} />
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-gray-400 text-sm">{label}:</span>
    <span className="text-[#00b4d8] text-sm">{value}</span>
  </div>
);

export default DeviceInfoCard; 