import React from 'react';

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
  return (
    // Container with horizontal scroll for responsive design
    <div className="overflow-x-auto">
      <table className="min-w-full">
        {/* Table Header */}
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            {/* Column Headers */}
            <th className="pb-3 font-medium">PID</th>
            <th className="pb-3 font-medium">PROCESS NAME</th>
            <th className="pb-3 font-medium">CPU%</th>
            <th className="pb-3 font-medium">MEMORY</th>
            <th className="pb-3 font-medium">TIME</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {/* Map through processes array to create table rows */}
          {processes.map((process) => (
            // Each row represents a single process
            <tr key={process.pid} className="text-sm">
              {/* Process ID */}
              <td className="py-2">{process.pid}</td>
              {/* Process Name */}
              <td className="py-2">{process.name}</td>
              {/* CPU Usage with % symbol */}
              <td className="py-2">{process.cpu}%</td>
              {/* Memory Usage formatted to 2 decimal places */}
              <td className="py-2">{process.memory.toFixed(2)}</td>
              {/* Process Runtime */}
              <td className="py-2">{process.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* "More" button section */}
      <div className="text-right mt-4">
        {/*  Will Implement more functionality below:*/}
        <button className="text-gray-500 text-sm">More &gt;&gt;</button>
      </div>
    </div>
  );
};

export default ProcessTable;