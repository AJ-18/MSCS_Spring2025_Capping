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
 *   @param {number} logicalCoreCount - Number of logical CPU cores
 */
const ProcessTable = ({ processes = [] }) => {
  // State to track which metric tab is currently active
  const [activeTab, setActiveTab] = useState('cpu'); // 'cpu' or 'memory'

  // Safely get numeric value or return 0 for undefined/null
  const safeNumber = (value) => {
    return (value !== undefined && value !== null) ? Number(value) || 0 : 0;
  };

  // Safely format number with toFixed
  const safeFixed = (value, digits = 1) => {
    const num = safeNumber(value);
    return num.toFixed(digits);
  };

  // Process the input data safely
  const safeProcesses = Array.isArray(processes) ? processes.filter(p => p && p.name) : [];
  
  // Get the logical core count from the first process or default to 8
  const logicalCoreCount = safeProcesses.length > 0 && safeProcesses[0].logicalCoreCount 
    ? safeProcesses[0].logicalCoreCount 
    : 8;

  // Helper function for proper memory display
  const formatMemory = (memoryMB) => {
    if (memoryMB === undefined || memoryMB === null) return '0 MB';
    
    // First ensure we have a valid number
    const memory = safeNumber(memoryMB);
    
    // Format memory values to match Task Manager style
    if (memory < 100) {
      // For small values, show 1 decimal place
      return `${memory.toFixed(1)} MB`;
    } else if (memory < 1000) {
      // For medium values, round to whole number
      return `${Math.round(memory)} MB`;
    } else {
      // For large values (>1000 MB), format with comma separators like Task Manager
      return `${Math.round(memory).toLocaleString()} MB`;
    }
  };
  
  // Consolidate processes with the same name by aggregating their resource usage
  const consolidatedProcesses = safeProcesses.reduce((acc, process) => {
    if (!process) return acc;
    
    const existingProcess = acc.find(p => p.name === process.name);
    
    if (existingProcess) {
      // Sum CPU and memory for processes with the same name, handling any undefined values
      existingProcess.cpu = safeNumber(existingProcess.cpu) + safeNumber(process.cpu);
      existingProcess.memory = safeNumber(existingProcess.memory) + safeNumber(process.memory);
      // Keep track of all PIDs belonging to this application
      if (process.pid) existingProcess.pids.push(process.pid);
    } else {
      // Add new unique process with a pids array
      acc.push({
        ...process,
        cpu: safeNumber(process.cpu),
        memory: safeNumber(process.memory),
        pids: [process.pid].filter(Boolean) // Remove undefined PIDs
      });
    }
    return acc;
  }, []);

  // Normalize CPU values if they exceed 100%
  const normalizedProcesses = consolidatedProcesses.map(process => {
    // CPU usage should never be more than 100% per logical processor
    // If it's significantly higher, it might be summed across all cores
    // Let's normalize it to a reasonable range
    let normalizedCpu = safeNumber(process.cpu);
    if (normalizedCpu > 100) {
      // If CPU usage is over 100%, cap it at 100%
      normalizedCpu = Math.min(normalizedCpu, 100);
    }
    
    return {
      ...process,
      cpu: normalizedCpu
    };
  });

  // Sort processes by CPU or Memory usage depending on active tab
  const sortedProcesses = [...normalizedProcesses].sort((a, b) => {
    if (activeTab === 'cpu') {
      return safeNumber(b.cpu) - safeNumber(a.cpu);
    }
    return safeNumber(b.memory) - safeNumber(a.memory);
  });

  // Take only the top 5 applications for the bars
  const topProcesses = sortedProcesses.slice(0, 5);

  // Find the maximum value for the active metric (used for bar scaling)
  const maxValue = Math.max(
    ...topProcesses.map(p => activeTab === 'cpu' ? safeNumber(p.cpu) : safeNumber(p.memory)),
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

  // Find the total CPU usage from all processes for sanity checks
  const totalCpuFromProcesses = sortedProcesses.reduce((total, process) => 
    total + safeNumber(process.cpu), 0);
  
  // Normalize total CPU usage based on logical cores to match system total
  // Individual process CPU values represent % of a single core
  // System total is normalized across all cores, so divide by logical core count
  const normalizedTotalCpu = logicalCoreCount > 0 ? 
    totalCpuFromProcesses / logicalCoreCount : totalCpuFromProcesses;
  
  // Log for debugging CPU usage discrepancies
  if (sortedProcesses.length > 0) {
    console.log(`ProcessTable - Total CPU from all processes: ${totalCpuFromProcesses.toFixed(1)}%, Normalized: ${normalizedTotalCpu.toFixed(1)}%, Logical cores: ${logicalCoreCount}`);
  }

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
            const value = activeTab === 'cpu' ? safeNumber(process.cpu) : safeNumber(process.memory);
            const percentage = (value / maxValue) * 100;
            const isMemory = activeTab === 'memory';
            const colorClass = getBarColor(percentage, isMemory);
            
            // Format display values appropriately (CPU as percentage, memory in MB/GB)
            const formattedValue = isMemory 
              ? formatMemory(value)
              : `${safeFixed(value)}%`;
            
            return (
              <div key={process.name || Math.random()} className="space-y-1.5">
                {/* Process name and value display */}
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {process.name || 'Unknown'} 
                    <span className="text-xs text-gray-400 ml-1">
                      ({process.pids?.length || 0} instance{(process.pids?.length || 0) !== 1 ? 's' : ''})
                    </span>
                  </span>
                  <span className="font-medium">{formattedValue}</span>
                </div>
                {/* Modern progress bar with dynamic width and gradient based on percentage */}
                <div className="h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  >
                    {percentage > 20 && (
                      <span className="absolute text-white text-xs font-medium left-3 top-1/2 transform -translate-y-1/2">
                        {(process.name || '').split('.')[0]}
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
              key={process.name || Math.random()} 
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-5 font-medium text-gray-800 truncate" title={process.name}>
                {process.name || 'Unknown'}
              </div>
              <div className="col-span-2 text-center text-gray-600">
                {process.pids?.length || 0}
              </div>
              <div className="col-span-2 text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  safeNumber(process.cpu) > 50 ? 'bg-red-100 text-red-800' : 
                  safeNumber(process.cpu) > 20 ? 'bg-orange-100 text-orange-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {safeFixed(process.cpu)}%
                </span>
              </div>
              <div className="col-span-3 text-right">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {formatMemory(process.memory)}
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