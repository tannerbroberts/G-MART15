import { useState, useEffect, useCallback, useRef } from 'react';


/**
 * Return type for the useFetch hook
 */
export interface UseFetchResult<T> {
  /** The data returned from the API */
  data: T | null;
  /** Whether a request is currently in progress */
  loading: boolean;
  /** Any error that occurred during the fetch */
  error: string | null;
  /** Function to manually trigger a new fetch request */
  refetch: (overrideOptions?: Partial<RequestInit>) => Promise<T>;
}

/**
 * Custom hook for handling fetch requests
 * @param url - The URL to fetch from
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Object containing data, loading state, error, and refetch function
 */
function useFetch<T = any>(url: string, options: RequestInit = {}): UseFetchResult<T> {
  const [state, setState] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true)
  useEffect(() => {
    const unMount = () => {
      mountedRef.current = false
    }
    return unMount
  }, [])

  const fetchData = useCallback(async (overrideOptions: Partial<RequestInit> = {}): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, { ...options, ...overrideOptions });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json() as T;
      if (mountedRef.current) setState(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during the fetch operation';
      if (mountedRef.current) {
        setError(errorMessage);
        setState(null);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // Initial fetch on mount or when dependencies change
  const startFetch = () => {
    if (url) {
      fetchData().catch(err => {
        // Error is already handled in fetchData, this just prevents unhandled promise rejection
        console.error('Fetch error caught in useEffect:', err);
      });
    }
  }
  useEffect(startFetch, [url, fetchData]);

  // Return the refetch function to allow manual refetching
  const refetch = useCallback((overrideOptions: Partial<RequestInit> = {}) => {
    return fetchData(overrideOptions);
  }, [fetchData]);

  return {
    data: state,
    loading,
    error,
    refetch
  };
}

export default useFetch;