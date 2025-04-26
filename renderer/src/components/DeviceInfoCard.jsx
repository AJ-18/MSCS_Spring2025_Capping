import React from 'react';

const DeviceInfoCard = ({ deviceInfo }) => {
  return (
    <div className="bg-[#1a1f2e] text-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Device Info</h2>
      
      <div className="space-y-3">
        <InfoRow label="Device Name" value={deviceInfo.deviceName} />
        <InfoRow label="Manufacturer" value={deviceInfo.manufacturer} />
        <InfoRow label="Model" value={deviceInfo.model} />
        <InfoRow label="Processor" value={deviceInfo.processor} />
        <InfoRow label="Physical Cores" value={deviceInfo.physicalCores} />
        <InfoRow label="Logical Cores" value={deviceInfo.logicalCores} />
        <InfoRow label="RAM" value={`${deviceInfo.ram} GB`} />
        <InfoRow label="Graphics" value={deviceInfo.graphics} />
        <InfoRow label="OS" value={deviceInfo.os} />
        <InfoRow label="System Type" value={deviceInfo.systemType} />
        <InfoRow label="Timestamp" value={deviceInfo.timestamp} />
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