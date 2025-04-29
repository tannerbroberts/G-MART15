/**
 * Authentication Context Provider
 * ------------------------------------------------------------------------------
 * Manages user authentication state throughout the React application
 * 
 * Features:
 * - Handles Google OAuth authentication flow
 * - Stores JWT token in localStorage
 * - Automatically authenticates based on existing token
 * - Configures axios for API requests with authentication
 * - Provides user info and authentication state to components
 * 
 * Environment configuration:
 * - VITE_API_URL: Base URL for API requests (set in .env files)
 * - VITE_RELATIVE_API: When "true", uses relative URLs in production
 */

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import axios from 'axios';

/**
 * Determines the API base URL based on environment
 * 
 * This function handles several deployment scenarios:
 * 1. Development: Uses localhost
 * 2. Production with relative paths: For same-domain deployment
 * 3. Production with absolute paths: For separate frontend/backend deployment
 * 
 * @returns The base URL for API requests
 */
const getApiBaseUrl = (): string => {
  const isProd = import.meta.env.PROD;
  const useRelativeApi = import.meta.env.VITE_RELATIVE_API === 'true';
  
  // If in production and using relative API paths
  // This is useful when the API and frontend are served from the same domain
  if (isProd && useRelativeApi) {
    return ''; // Empty string for relative paths in production
  }
  
  // Otherwise use configured API URL or fallback to defaults
  return import.meta.env.VITE_API_URL || (isProd 
    ? 'https://gmart15-blackjack-express-1946fea61846.herokuapp.com' 
    : 'http://localhost:3000');
};

// Configure axios with the API base URL
const API_BASE_URL = getApiBaseUrl();
if (API_BASE_URL) {
  console.log(`🌐 API configured with base URL: ${API_BASE_URL || '(relative URLs)'}`);
  axios.defaults.baseURL = API_BASE_URL;
}

/**
 * User object structure returned from the API
 */
interface User {
  id: number;
  email: string;
  username: string;
  google_id?: string;
}

/**
 * Authentication context interface provided to consuming components
 */
interface AuthContextType {
  /** The currently authenticated user or null if not logged in */
  currentUser: User | null;
  
  /** Whether authentication state is being loaded/determined */
  loading: boolean;
  
  /** Any authentication error message */
  error: string | null;
  
  /** Function to log the user out */
  logout: () => void;
  
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
}

// Create the context with undefined default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context in components
 * @returns The authentication context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and makes auth available
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in localStorage on page load
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('🔑 Found authentication token in storage');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Handle authentication callback with token from URL
    // This happens after OAuth redirect back from the server
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      console.log('🔑 Found authentication token in URL');
      localStorage.setItem('auth_token', tokenFromUrl);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
      fetchCurrentUser();
      // Clean the URL to remove the token
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  /**
   * Fetch the currently authenticated user from the API
   * Sets user state or triggers logout if unauthorized
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/status');
      if (response.data.isAuthenticated) {
        console.log('✅ Successfully authenticated user');
        setCurrentUser(response.data.user);
      } else {
        // Token might be invalid or expired
        console.log('❌ Authentication status check failed');
        logout();
      }
    } catch (err) {
      console.error('❌ Error fetching user data:', err);
      setError('Failed to fetch user data. Please try logging in again.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log the user out by removing token and user state
   */
  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    
    // Send logout request to server
    axios.post('/auth/logout').catch(err => {
      console.error('❌ Error during logout:', err);
    });
  };

  // Prepare context value for consumers
  const value = {
    currentUser,
    loading,
    error,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
