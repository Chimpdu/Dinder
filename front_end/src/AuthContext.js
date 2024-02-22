import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state to track logout process
  const navigate = useNavigate();

  const logout = async () => {
    setIsLoggingOut(true); // Indicate that logout process has started
    try {
      await fetch('/api/api/logout', { method: 'POST', credentials: 'include' });
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setIsLoggingOut(false); // Reset logout process indicator
  };

  const checkAuthStatus = async () => {
    if (isLoggingOut) return; // Skip check if logout process is initiated

    try {
      const response = await fetch('/api/api/auth', { /* existing fetch options */ });
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
      if (!data.isAuthenticated) navigate('/login');
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => { checkAuthStatus(); }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);