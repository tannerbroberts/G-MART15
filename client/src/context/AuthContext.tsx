import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  username: string;
  google_id?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for token on page load
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Handle auth callback with token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('auth_token', tokenFromUrl);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
      fetchCurrentUser();
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/status');
      if (response.data.isAuthenticated) {
        setCurrentUser(response.data.user);
      } else {
        // Token might be invalid
        logout();
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    
    // Send logout request to server
    axios.post('/auth/logout').catch(err => {
      console.error('Error during logout:', err);
    });
  };

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
