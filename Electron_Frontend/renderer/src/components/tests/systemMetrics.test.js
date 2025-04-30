import { fetchSystemMetrics } from '../../services/systemMetrics';
import { mockSystemMetrics } from '../../mocks/systemMetrics.mock';

describe('System Metrics API', () => {
  it('fetches system metrics successfully', async () => {
    // Setup mock response
    window.electronAPI.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

    const data = await fetchSystemMetrics();
    expect(data).toEqual(mockSystemMetrics);
    expect(window.electronAPI.getSystemMetrics).toHaveBeenCalledTimes(1);
  });

  it('handles API errors properly', async () => {
    const error = new Error('API Error');
    window.electronAPI.getSystemMetrics.mockRejectedValue(error);

    await expect(fetchSystemMetrics()).rejects.toThrow('API Error');
  });

  it('handles network errors properly', async () => {
    // Mock network error
    window.electronAPI.getSystemMetrics.mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(fetchSystemMetrics()).rejects.toThrow('Network error');
  });
}); 