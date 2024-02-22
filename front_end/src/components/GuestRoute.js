// GuestRoute.js - Accessible only when not authenticated. Otherwise, redirect to home page
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const GuestRoute = ({ children, ...rest }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export default GuestRoute;
