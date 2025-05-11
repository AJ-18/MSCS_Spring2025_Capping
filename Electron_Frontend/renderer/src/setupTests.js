// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the Electron API globally for all tests
const mockGetSystemMetrics = jest.fn();
global.window.electronAPI = {
  getSystemMetrics: mockGetSystemMetrics
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
