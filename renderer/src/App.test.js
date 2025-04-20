import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders dashboard', async () => {
    window.electronAPI.getSystemMetrics.mockImplementation(
      () => new Promise(() => {})
    );

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
