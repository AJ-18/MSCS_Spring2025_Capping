import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProcessTable from '../ProcessTable';

describe('ProcessTable Component', () => {
  const sampleProcesses = [
    { pid: 1, name: 'ROOT', cpu: 14, memory: 0.25, time: '0:13:34' },
    { pid: 2, name: 'CHROME', cpu: 34, memory: 0.50, time: '0:19:15' }
  ];

  test('renders table headers correctly', () => {
    render(<ProcessTable processes={sampleProcesses} />);
    expect(screen.getByText('PID')).toBeInTheDocument();
    expect(screen.getByText('PROCESS NAME')).toBeInTheDocument();
    expect(screen.getByText('CPU%')).toBeInTheDocument();
  });

  test('renders process data correctly', () => {
    render(<ProcessTable processes={sampleProcesses} />);
    expect(screen.getByText('ROOT')).toBeInTheDocument();
    expect(screen.getByText('14%')).toBeInTheDocument();
  });

  test('handles empty process list', () => {
    render(<ProcessTable processes={[]} />);
    expect(screen.queryByText('ROOT')).not.toBeInTheDocument();
  });
});