import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { mockSystemMetrics } from '../../mocks/systemMetrics.mock';

// Mock the systemMetrics service
const mockGetSystemMetrics = jest.fn();
jest.mock('../../services/systemMetrics', () => ({
  getSystemMetrics: () => mockGetSystemMetrics()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockGetSystemMetrics.mockReset();
  });

  test('shows loading state initially', () => {
    // Setup mock to return a pending promise
    mockGetSystemMetrics.mockImplementation(() => new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders dashboard content after loading', async () => {
    // Setup mock to return data
    mockGetSystemMetrics.mockResolvedValue(mockSystemMetrics);
    
    render(<Dashboard />);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check for rendered content
    expect(screen.getByText('CPU')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Setup mock to reject
    mockGetSystemMetrics.mockRejectedValue(new Error('Failed to fetch'));

    render(<Dashboard />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error loading system metrics')).toBeInTheDocument();
    });
  });
});