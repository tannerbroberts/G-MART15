import './loginpage.css';
import fannedcards from './fannedcards.png';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import GoogleSignin from './GoogleSignin';
import axios from 'axios';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to the menu
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/menu');
    }
  }, [isAuthenticated, navigate]);

  const handleDevLogin = async () => {
    try {
      const response = await axios.post('/auth/dev-login');
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        window.location.reload(); // Reload to trigger auth context update
      }
    } catch (error) {
      console.error('Dev login failed:', error);
    }
  };

  return (
    <>
      <div className="textcontainer">
        <p>G-MART PRESENTS</p>
        <h1>BLACKJACK</h1>
      </div>
      {process.env.NODE_ENV !== 'production' && (
        <button onClick={handleDevLogin} className="dev-login-button">
          Development Login
        </button>
      )}
      <GoogleSignin />
      <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
    </>
  );
};

export default LoginPage;