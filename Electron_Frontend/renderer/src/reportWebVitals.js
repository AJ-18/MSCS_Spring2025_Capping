/**
 * Web Vitals Reporting Module
 * 
 * This module provides functionality to measure and report Core Web Vitals
 * and other performance metrics for the application. It dynamically imports
 * the web-vitals library to minimize the initial bundle size.
 * 
 * The metrics collected include:
 * - CLS (Cumulative Layout Shift): Measures visual stability
 * - FID (First Input Delay): Measures interactivity
 * - FCP (First Contentful Paint): Measures perceived load speed
 * - LCP (Largest Contentful Paint): Measures loading performance
 * - TTFB (Time to First Byte): Measures time to initial response
 * 
 * @param {Function} onPerfEntry - Callback function to handle performance metrics
 */
const reportWebVitals = onPerfEntry => {
  // Only run if a valid function is provided as the callback
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the web-vitals library
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Register each metric with the provided callback
      getCLS(onPerfEntry);  // Cumulative Layout Shift
      getFID(onPerfEntry);  // First Input Delay
      getFCP(onPerfEntry);  // First Contentful Paint
      getLCP(onPerfEntry);  // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

export default reportWebVitals;
