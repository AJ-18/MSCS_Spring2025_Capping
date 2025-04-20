export const fetchSystemMetrics = async () => {
    // In real implementation, this would call the backend API
    const response = await fetch('/api/system-metrics');
    return response.json();
  };