import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProviderCheck } from './useProviderCheck';

/**
 * Custom hook that ensures the component is used within an AuthProvider
 * and also requires authentication, redirecting to login if not authenticated
 * @param redirectPath - Path to redirect to if not authenticated (default: '/login')
 * @returns The auth context value
 */
export function useRequireAuth(redirectPath = '/login') {
  // This will throw an error if used outside AuthProvider
  const auth = useProviderCheck();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate(redirectPath);
    }
  }, [auth.loading, auth.isAuthenticated, navigate, redirectPath]);
  
  return auth;
}