import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the systemMetrics service
const mockGetSystemMetrics = jest.fn();
jest.mock('./services/systemMetrics', () => ({
  getSystemMetrics: () => mockGetSystemMetrics()
}));

// Test 1: Verifies initial loading state
test('renders dashboard', () => {
  // Setup mock to return a pending promise
  mockGetSystemMetrics.mockImplementation(() => new Promise(() => {}));
  
  render(<App />);
  // Check for loading state initially
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
