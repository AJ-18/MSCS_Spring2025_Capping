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
const DeviceInfoCard = ({ deviceInfo, isOnline = false }) => {
  // If deviceInfo is null or undefined, show loading state
  if (!deviceInfo) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-700 opacity-10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-700 opacity-10 rounded-full -ml-10 -mb-10"></div>
        
        <h2 className="text-2xl font-semibold mb-6 relative z-10">Device Info</h2>
        <div className="text-center py-8 relative z-10">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-t-blue-400 border-blue-200 rounded-full mb-4"></div>
          <div className="text-blue-100">Loading device information...</div>
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
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-xl p-8 shadow-lg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-700 opacity-10 rounded-full -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-700 opacity-10 rounded-full -ml-10 -mb-10"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-indigo-500 opacity-5 rounded-full transform -translate-y-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Device Info</h2>
          <span className={`px-3 py-1 ${isOnline ? 'bg-green-500 bg-opacity-20 text-green-300' : 'bg-gray-500 bg-opacity-20 text-gray-300'} rounded-full text-xs font-medium flex items-center`}>
            <span className={`w-2 h-2 ${isOnline ? 'bg-green-400' : 'bg-gray-400'} rounded-full mr-1.5`}></span>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0019.414 6L14 .586A2 2 0 0012.586 0H10zm-2 2H2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2.586A2 2 0 0010.414 14L6 9.586A2 2 0 004.586 8H2z" clipRule="evenodd" />
            </svg>} 
            label="Device Name" 
            value={getDeviceValue('deviceName')} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>} 
            label="Manufacturer" 
            value={getDeviceValue('manufacturer')} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>} 
            label="Model" 
            value={getDeviceValue('model')} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>} 
            label="Processor" 
            value={getDeviceValue('processor')} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 7H7v6h6V7z" />
              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>}  
            label="Physical Cores" 
            value={getDeviceValue('physicalCores', '0', formatNumber)} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>} 
            label="Logical Cores" 
            value={getDeviceValue('logicalCores', '0', formatNumber)} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>} 
            label="RAM" 
            value={getDeviceValue('ram', '0', formatRam)} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>} 
            label="Graphics" 
            value={getDeviceValue('graphics')} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>} 
            label="OS" 
            value={getDeviceValue('os')} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm10.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>} 
            label="System Type" 
            value={getDeviceValue('systemType')} 
          />
          <InfoItem 
            icon={<svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>} 
            label="Last Update" 
            value={getDeviceValue('timestamp', 'N/A', formatDate)} 
          />
        </div>
      </div>
    </div>
  );
};

/**
 * InfoItem Component
 * 
 * Displays a single device specification with an icon, label, and value
 */
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center">
    <div className="w-8 h-8 flex items-center justify-center bg-blue-800 bg-opacity-30 rounded-lg mr-3 text-blue-300">
      {icon}
    </div>
    <div className="flex-1 flex flex-col">
      <span className="text-xs text-blue-200 opacity-80">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  </div>
);

export default DeviceInfoCard; 