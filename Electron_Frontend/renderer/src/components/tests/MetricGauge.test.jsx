import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricGauge from '../MetricGauge';

describe('MetricGauge Component', () => {
  // Default props for testing
  const defaultProps = {
    title: 'CPU',
    value: 67,
    color: '#36B5C5',
    suffix: '%'
  };

  // Test 1: Verifies gauge title renders
  test('renders gauge with correct title', () => {
    // Checks if title is displayed
    render(<MetricGauge {...defaultProps} />);
    expect(screen.getByText('CPU')).toBeInTheDocument();
  });

  // Test 2: Validates value display
  test('displays correct value', () => {
    // Ensures value is shown correctly
    render(<MetricGauge {...defaultProps} />);
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  // Test 3: Tests optional subtitle feature
  test('renders subtitle when provided', () => {
    // Verifies subtitle appears when provided
    const propsWithSubtitle = {
      ...defaultProps,
      subtitle: '1.65/1.75 GB'
    };
    render(<MetricGauge {...propsWithSubtitle} />);
    expect(screen.getByText('1.65/1.75 GB')).toBeInTheDocument();
  });
});