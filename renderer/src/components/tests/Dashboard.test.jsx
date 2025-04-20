import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { mockSystemMetrics } from '../../mocks/systemMetrics.mock';

describe('Dashboard Component', () => {
  test('shows loading state initially', async () => {
    // Setup mock to return a pending promise
    window.electronAPI.getSystemMetrics.mockImplementation(
      () => new Promise(() => {})
    );

    await act(async () => {
      render(<Dashboard />);
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders dashboard content after loading', async () => {
    window.electronAPI.getSystemMetrics.mockResolvedValue(mockSystemMetrics);
    
    await act(async () => {
      render(<Dashboard />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('CPU')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    window.electronAPI.getSystemMetrics.mockRejectedValue(new Error('Failed to fetch'));

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading system metrics')).toBeInTheDocument();
    });
  });
});