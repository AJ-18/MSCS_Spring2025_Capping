import React from 'react';

const ProcessTable = ({ processes }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            <th className="pb-3 font-medium">PID</th>
            <th className="pb-3 font-medium">PROCESS NAME</th>
            <th className="pb-3 font-medium">CPU%</th>
            <th className="pb-3 font-medium">MEMORY</th>
            <th className="pb-3 font-medium">TIME</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.pid} className="text-sm">
              <td className="py-2">{process.pid}</td>
              <td className="py-2">{process.name}</td>
              <td className="py-2">{process.cpu}%</td>
              <td className="py-2">{process.memory.toFixed(2)}</td>
              <td className="py-2">{process.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right mt-4">
        <button className="text-gray-500 text-sm">More &gt;&gt;</button>
      </div>
    </div>
  );
};

export default ProcessTable;