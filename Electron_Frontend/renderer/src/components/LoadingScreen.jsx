import React from 'react';

/**
 * Shared loading screen component
 * 
 * Displays a consistent loading animation with the SPAR logo.
 * Used across the application for a professional loading experience.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Custom loading message to display (defaults to "Loading...")
 */
const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white bg-opacity-70 rounded-2xl shadow-lg backdrop-blur-sm max-w-md w-full">
        <img 
          src="SPAR.png" 
          alt="SPAR Logo" 
          className="w-24 h-24 mx-auto mb-6"
        />
        
        <div className="inline-block animate-spin h-12 w-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full mb-6"></div>
        
        <p className="text-indigo-700 font-medium text-lg">{message}</p>
        <p className="text-gray-500 text-sm mt-2">System Performance Analytics & Reporting</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 