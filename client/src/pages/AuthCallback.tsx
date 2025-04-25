import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The token handling is done in AuthContext
    // Just need to redirect the user after the context processes the token
    const timer = setTimeout(() => {
      navigate('/'); // Redirect to home/main page
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  // If there's an error parameter in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
    }
  }, []);

  return (
    <div className="auth-callback-container">
      {error ? (
        <div className="auth-error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')}>Return to Login</button>
        </div>
      ) : (
        <div className="auth-success">
          <h2>Authentication Successful</h2>
          <p>You have successfully signed in with Google.</p>
          <p>Redirecting to the game...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;