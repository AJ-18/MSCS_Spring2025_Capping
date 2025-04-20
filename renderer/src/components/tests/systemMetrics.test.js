import { fetchSystemMetrics } from '../../services/systemMetrics';
import { mockSystemMetrics } from '../../mocks/systemMetrics.mock';

// Mock the fetch function
global.fetch = jest.fn();

describe('System Metrics API', () => {
  beforeEach(() => {
    // Clear mock before each test
    fetch.mockClear();
  });

  // Test 1: Validates successful API calls
  it('fetches system metrics successfully', async () => {
    // Mocks successful API response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        json: () => Promise.resolve(mockSystemMetrics)
      })
    );

    const data = await fetchSystemMetrics();

    // Verifies API endpoint is called
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/system-metrics');

    // Validates returned data structure
    expect(data).toEqual(mockSystemMetrics);
    expect(data.cpu.usage).toBe(67);
    expect(data.memory.total).toBe(1.75);
    expect(data.processes).toHaveLength(2);
  });

  // Test 2: Tests error handling
  it('handles API errors properly', async () => {
    // Simulates API failure
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('API Error'))
    );

    await expect(fetchSystemMetrics()).rejects.toThrow('API Error');
  });
}); 