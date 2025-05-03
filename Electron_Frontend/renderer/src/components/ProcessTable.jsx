import React, { useState } from 'react';

/**
 * ProcessTable Component
 * Displays a table of system processes with their metrics
 * 
 * @param {Object[]} processes - Array of process objects containing:
 *   @param {number} pid - Process ID
 *   @param {string} name - Process name
 *   @param {number} cpu - CPU usage percentage
 *   @param {number} memory - Memory usage in GB
 *   @param {string} time - Process runtime
 */
const ProcessTable = ({ processes }) => {
  // State to track which metric tab is currently active
  const [activeTab, setActiveTab] = useState('cpu'); // 'cpu' or 'memory'

  // Sort processes by CPU or Memory usage depending on active tab
  const sortedProcesses = [...processes].sort((a, b) => {
    if (activeTab === 'cpu') {
      return b.cpu - a.cpu;
    }
    return b.memory - a.memory;
  });

  // Find the maximum value for the active metric (used for bar scaling)
  const maxValue = Math.max(
    ...sortedProcesses.map(p => activeTab === 'cpu' ? p.cpu : p.memory)
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Toggle between CPU and Memory views */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'cpu'
              ? 'bg-white shadow-sm text-gray-800'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('cpu')}
        >
          CPU Usage
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'memory'
              ? 'bg-white shadow-sm text-gray-800'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('memory')}
        >
          Memory Usage
        </button>
      </div>

      {/* Bar Chart - Visual representation of top 5 processes by resource usage */}
      <div className="bg-white rounded-lg p-6">
        <div className="space-y-4">
          {sortedProcesses.slice(0, 5).map((process) => {
            // Calculate the current value and relative percentage for visualization
            const value = activeTab === 'cpu' ? process.cpu : process.memory;
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={process.pid} className="space-y-1">
                {/* Process name, PID, and value display */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{process.name} ({process.pid})</span>
                  <span>{value.toFixed(1)}{activeTab === 'cpu' ? '%' : ' MB'}</span>
                </div>
                {/* Progress bar with dynamic width based on percentage */}
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Details Cards - Detailed information for top 5 processes */}
      <div className="space-y-4">
        {sortedProcesses.slice(0, 5).map((process) => (
          <div
            key={process.pid}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Process name and metrics header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{process.name}</h3>
                {/* Metrics display with icons */}
                <div className="flex items-center space-x-4 mt-2">
                  {/* CPU usage indicator */}
                  <div className="flex items-center text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span>{process.cpu.toFixed(1)}% CPU</span>
                  </div>
                  {/* Memory usage indicator */}
                  <div className="flex items-center text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{process.memory.toFixed(1)} MB</span>
                  </div>
                </div>
              </div>
              {/* Process ID display */}
              <div className="text-sm text-gray-500">
                PID: {process.pid}
              </div>
            </div>
            {/* Timestamp of when the data was collected */}
            <div className="mt-3 text-sm text-gray-500">
              Timestamp: {new Date().toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessTable;