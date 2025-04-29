import './loginpage.css';
import fannedcards from './fannedcards.png';
<<<<<<< HEAD
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import GoogleSignin from './GoogleSignin';
=======

import './LoginPage.css';
>>>>>>> d8880f36bcbeaa4ba59d28f2161cd4e3c3054bb2

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // If already authenticated, redirect to the menu
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/menu');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <div className="textcontainer">
        <p>G-MART PRESENTS</p>
        <h1>BLACKJACK</h1>
      </div>
      <GoogleSignin />
      <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
    </>
  );
};

export default LoginPage;