import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    // Return a loading indicator while authentication is being checked
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated, save the current path to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;