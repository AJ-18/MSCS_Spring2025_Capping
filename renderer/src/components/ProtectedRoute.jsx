import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        let user = null;
        
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
        
        if (!user || !user.id) {
          console.log('No valid user data found in localStorage');
          setAuthError('User data not found. Please log in again.');
          setIsVerifying(false);
          return;
        }
        
        console.log('Authentication verified', { userId: user.id });
        setIsValid(true);
        setIsVerifying(false);
      } catch (error) {
        console.error('Error during auth verification:', error);
        setAuthError('Authentication error. Please log in again.');
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, []);

  if (isVerifying) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isValid) {
    // Clear any potentially corrupted auth data
    if (authError) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location, authError }} replace />;
  }

  return children;
};

export default ProtectedRoute; 