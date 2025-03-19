import React, { useState } from 'react';

// Sample data - replace this with real process data later
const sampleProcesses = [
  { id: 1, name: "chrome.exe", cpu: 2.4, memory: "234.5 MB", disk: "0.1 MB/s", network: "0.2 Mbps", status: "Running" },
  { id: 2, name: "firefox.exe", cpu: 1.2, memory: "185.3 MB", disk: "0.3 MB/s", network: "0.1 Mbps", status: "Running" },
  { id: 3, name: "spotify.exe", cpu: 0.8, memory: "156.7 MB", disk: "0.0 MB/s", network: "1.2 Mbps", status: "Running" },
  { id: 4, name: "discord.exe", cpu: 1.5, memory: "142.2 MB", disk: "0.2 MB/s", network: "0.5 Mbps", status: "Running" },
];

const ProcessList = () => {
  const [sortField, setSortField] = useState('cpu');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('name')}>
                Process Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('cpu')}>
                CPU %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('memory')}>
                Memory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('disk')}>
                Disk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('network')}>
                Network
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sampleProcesses.map((process) => (
              <tr key={process.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {process.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {process.cpu}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {process.memory}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {process.disk}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {process.network}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {process.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessList;