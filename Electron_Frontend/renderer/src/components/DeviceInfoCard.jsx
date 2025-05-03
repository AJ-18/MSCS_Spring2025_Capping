import React from 'react';

/**
 * DeviceInfoCard Component
 * 
 * Displays detailed hardware and software specifications of a device
 * Shows information such as device name, manufacturer, model, processor,
 * RAM, graphics, OS, and system architecture
 * 
 * Includes loading state and fallback values for missing information
 * Uses consistent styling with a dark blue background and accent colors
 */
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

  /**
   * Helper function to safely access property values with fallbacks
   * 
   * @param {string} property - The property name to access from deviceInfo
   * @param {any} defaultValue - The default value to use if property is undefined
   * @param {Function} formatter - Optional function to format the value
   * @returns {any} The formatted property value or default value
   */
  const getDeviceValue = (property, defaultValue = 'Not available', formatter = null) => {
    let value = deviceInfo[property];
    
    // Return default value if property is null or undefined
    if (value == null) {
      return defaultValue;
    }
    
    // Apply formatter function if provided
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

  // Format functions for different property types
  
  /**
   * Formats a numeric value as a string
   * Handles both number and string inputs
   */
  const formatNumber = (value) => {
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toString();
    }
    return String(value);
  };

  /**
   * Formats RAM values to include GB unit and fixed decimal places
   * Handles both number and string inputs
   */
  const formatRam = (value) => {
    if (typeof value === 'number') return `${value.toFixed(1)} GB`;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? `${value} GB` : `${num.toFixed(1)} GB`;
    }
    return `${value} GB`;
  };

  /**
   * Formats timestamp values as localized date/time strings
   * Handles both Date objects and ISO string dates
   */
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

  // Main component render with device specifications
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

/**
 * InfoRow Component
 * 
 * Helper component to display a single row of device information
 * Shows a label and corresponding value with consistent styling
 */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-gray-400 text-sm">{label}:</span>
    <span className="text-[#00b4d8] text-sm">{value}</span>
  </div>
);

export default DeviceInfoCard; 