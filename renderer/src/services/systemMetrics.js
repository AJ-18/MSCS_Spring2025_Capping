export const fetchSystemMetrics = async () => {
  try {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    const data = await window.electronAPI.getSystemMetrics();
    return data;
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }
};