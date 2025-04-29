import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook that ensures it's being used within an AuthProvider
 * Throws an error if used outside the AuthProvider context
 * @returns The auth context value
 */
export function useProviderCheck() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('This hook must be used within an AuthProvider');
  }
  
  return context;
}