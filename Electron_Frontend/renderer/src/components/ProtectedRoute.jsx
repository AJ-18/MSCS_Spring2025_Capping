import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * A route wrapper that verifies user authentication before allowing access
 * Redirects unauthenticated users to the login page
 * Preserves the attempted location for redirect after successful login
 * Handles authentication token and user data validation
 * 
 * @param {ReactNode} children - The child components to render if authentication is successful
 */
const ProtectedRoute = ({ children }) => {
  // Use location to save attempted path for redirect after login
  const location = useLocation();
  // Loading state during authentication verification
  const [isVerifying, setIsVerifying] = useState(true);
  // Authentication status state
  const [isValid, setIsValid] = useState(false);
  // Error message for authentication failures
  const [authError, setAuthError] = useState(null);
  
  // Effect to verify authentication on component mount
  useEffect(() => {
    /**
     * Verifies user authentication by checking localStorage
     * Validates both token existence and user data integrity
     */
    const verifyAuth = async () => {
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        let user = null;
        
        // Parse user data with error handling
        try {
          user = JSON.parse(localStorage.getItem('user') || 'null');
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          setAuthError('Invalid user data. Please log in again.');
          setIsVerifying(false);
          return;
        }
        
        // Check both token and user data exist
        if (!token) {
          console.log('No token found in localStorage');
          setIsVerifying(false);
          return;
        }
        
        // Validate user object has required fields
        if (!user || !user.id) {
          console.log('No valid user data found in localStorage');
          setAuthError('User data not found. Please log in again.');
          setIsVerifying(false);
          return;
        }
        
        // Authentication is valid, update state
        console.log('Authentication verified', { userId: user.id });
        setIsValid(true);
        setIsVerifying(false);
      } catch (error) {
        // Handle unexpected errors during verification
        console.error('Error during auth verification:', error);
        setAuthError('Authentication error. Please log in again.');
        setIsVerifying(false);
      }
    };

    // Run verification on component mount
    verifyAuth();
  }, []);

  // Show loading indicator while verifying
  if (isVerifying) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Redirect to login if authentication is invalid
  if (!isValid) {
    // Clear any potentially corrupted auth data
    if (authError) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location, authError }} replace />;
  }

  // Render child components if authentication is valid
  return children;
};

export default ProtectedRoute; 