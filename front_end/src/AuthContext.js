import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook to get the current location

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/api/logout', { method: 'POST', credentials: 'include' });
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setIsLoggingOut(false);
  };

  const checkAuthStatus = async () => {
    if (isLoggingOut || location.pathname === '/register') return; // Do not redirect if on the register page

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

  useEffect(() => { checkAuthStatus(); }, [navigate, location.pathname]); // Add location.pathname as a dependency

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
