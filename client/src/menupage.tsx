import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginpage.css';
import fannedcards from './fannedcards.png';

const MenuPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleNewGame = async () => {
        setLoading(true);
        try {
            // Add game creation logic here
            navigate('/game');
        } catch (error) {
            console.error('Failed to create game:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
      <>
        <div className="textcontainer">
          <h1>BLACKJACK</h1>
        </div>
        <button 
            className="menubutton" 
            onClick={handleNewGame}
            disabled={loading}
        >
            {loading ? 'Creating...' : 'New Game'}
        </button>
        <button 
            className="menubutton" 
            onClick={() => navigate('/join-game')}
        >
            Join Game
        </button>
        <button 
            className="menubutton" 
            onClick={() => navigate('/profile')}
        >
            Profile
        </button>
        <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
      </>
    );
  };

export default MenuPage;