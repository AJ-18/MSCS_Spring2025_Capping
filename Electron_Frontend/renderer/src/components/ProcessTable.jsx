import React, { useState } from 'react';

/**
 * ProcessTable Component
 * Displays a table of system processes with their metrics
 * 
 * @param {Object[]} processes - Array of process objects containing:
 *   @param {number} pid - Process ID
 *   @param {string} name - Process name
 *   @param {number} cpu - CPU usage percentage
 *   @param {number} memory - Memory usage in MB
 */
const ProcessTable = ({ processes }) => {
  // State to track which metric tab is currently active
  const [activeTab, setActiveTab] = useState('cpu'); // 'cpu' or 'memory'

  // Consolidate processes with the same name by aggregating their resource usage
  const consolidatedProcesses = processes.reduce((acc, process) => {
    const existingProcess = acc.find(p => p.name === process.name);
    
    if (existingProcess) {
      // Sum CPU and memory for processes with the same name
      existingProcess.cpu += process.cpu;
      existingProcess.memory += process.memory;
      // Keep track of all PIDs belonging to this application
      existingProcess.pids.push(process.pid);
    } else {
      // Add new unique process with a pids array
      acc.push({
        ...process,
        pids: [process.pid]
      });
    }
    return acc;
  }, []);

  // Sort processes by CPU or Memory usage depending on active tab
  const sortedProcesses = [...consolidatedProcesses].sort((a, b) => {
    if (activeTab === 'cpu') {
      return b.cpu - a.cpu;
    }
    return b.memory - a.memory;
  });

  // Take only the top 5 applications for the bars
  const topProcesses = sortedProcesses.slice(0, 5);

  // Find the maximum value for the active metric (used for bar scaling)
  const maxValue = Math.max(
    ...topProcesses.map(p => activeTab === 'cpu' ? p.cpu : p.memory),
    0.1 // Prevent division by zero
  );

  // Get color based on usage percentage
  const getBarColor = (percentage, isMemory = false) => {
    if (isMemory) {
      return percentage > 80 ? 'from-purple-600 to-fuchsia-600' : 
             percentage > 50 ? 'from-purple-500 to-fuchsia-500' : 
             'from-purple-400 to-fuchsia-400';
    } else {
      return percentage > 80 ? 'from-red-500 to-orange-500' : 
             percentage > 50 ? 'from-orange-400 to-yellow-500' : 
             'from-blue-400 to-cyan-500';
    }
  };

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

      {/* Bar Chart - Visual representation of top 5 unique applications by resource usage */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">
          Top 5 Applications by {activeTab === 'cpu' ? 'CPU' : 'Memory'} Usage
        </h3>
        
        <div className="space-y-5">
          {topProcesses.map((process) => {
            // Calculate the current value and relative percentage for visualization
            const value = activeTab === 'cpu' ? process.cpu : process.memory;
            const percentage = (value / maxValue) * 100;
            const isMemory = activeTab === 'memory';
            const colorClass = getBarColor(percentage, isMemory);
            
            // Format memory values
            const formattedMemory = isMemory && value >= 1000 
              ? `${(value / 1000).toFixed(2)} GB` 
              : `${value.toFixed(1)}${isMemory ? ' MB' : '%'}`;
            
            return (
              <div key={process.name} className="space-y-1.5">
                {/* Process name and value display */}
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{process.name} <span className="text-xs text-gray-400 ml-1">({process.pids.length} instance{process.pids.length !== 1 ? 's' : ''})</span></span>
                  <span className="font-medium">{formattedMemory}</span>
                </div>
                {/* Modern progress bar with dynamic width and gradient based on percentage */}
                <div className="h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  >
                    {percentage > 20 && (
                      <span className="absolute text-white text-xs font-medium left-3 top-1/2 transform -translate-y-1/2">
                        {process.name.split('.')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Details Section - Detailed information for all processes in a scrollable container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Process Details</h3>
          <div className="text-sm text-gray-500">
            {sortedProcesses.length} unique applications
          </div>
        </div>
        
        {/* Header row for the process list */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 rounded-t-lg text-sm font-medium text-gray-600">
          <div className="col-span-5">Application</div>
          <div className="col-span-2 text-center">Instances</div>
          <div className="col-span-2 text-right">CPU</div>
          <div className="col-span-3 text-right">Memory</div>
        </div>
        
        {/* Scrollable container for process details */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {sortedProcesses.map((process) => (
            <div 
              key={process.name} 
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-5 font-medium text-gray-800 truncate" title={process.name}>
                {process.name}
              </div>
              <div className="col-span-2 text-center text-gray-600">
                {process.pids.length}
              </div>
              <div className="col-span-2 text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  process.cpu > 50 ? 'bg-red-100 text-red-800' : 
                  process.cpu > 20 ? 'bg-orange-100 text-orange-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {process.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="col-span-3 text-right">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {(process.memory >= 1000) ? 
                    `${(process.memory / 1000).toFixed(2)} GB` : 
                    `${process.memory.toFixed(1)} MB`}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty state if no processes */}
        {sortedProcesses.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No process data available
          </div>
        )}
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #f1f1f1;
          border-radius: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d4d4d8;
          border-radius: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a1a1aa;
        }
      `}</style>
    </div>
  );
};

export default ProcessTable;