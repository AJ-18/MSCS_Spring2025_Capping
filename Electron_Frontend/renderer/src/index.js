/**
 * Application Entry Point
 * This is the main entry file for the React application that runs in the Electron renderer process
 */

// Import React and ReactDOM for rendering
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import global CSS styles
import './index.css';

// Import root App component
import App from './App';

/**
 * Create and render the React root
 * Uses the new React 18 createRoot API for concurrent rendering
 * Renders the App component inside StrictMode for additional development checks
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
