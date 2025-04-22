import './App.css'
import GoogleSignin from './GoogleSignin'
import React, { useState, useCallback } from 'react';
import './App.css';
import LoginPage from './loginpage';
import CardSelector from './components/CardSelector';
import CardTable from './components/CardTable';
import PipPlacementGenerator from './components/PipPlacementGenerator';
import { initialCards } from './initialCards';
import { handleCardClick } from './utils';
import { PipPlacementMap } from './cardGenerator';

const App: React.FC = () => {
  const [cards, setCards] = useState(initialCards);
  const [showPipGenerator, setShowPipGenerator] = useState(false);
  
  // We'll store custom pip placements in localStorage for persistence
  const handleSavePipPlacements = useCallback((placements: PipPlacementMap) => {
    // Save to localStorage for persistence
    localStorage.setItem('customPipPlacements', JSON.stringify(placements));
    console.log('Saved pip placements to localStorage');
  }, []);

  const onCardClick = (id: string) => setCards(cards => handleCardClick(cards, id));

  return (
    <div className='appcontainer'>
      <div className="card-table">
        <LoginPage />
        
        {/* Fixed top bar with controls */}
        <div style={{ 
          position: 'absolute', 
          top: 24, 
          right: 24, 
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <div>
            <CardSelector />
            <button 
              onClick={() => setShowPipGenerator(!showPipGenerator)}
              style={{ 
                marginLeft: '10px', 
                padding: '8px 12px',
                position: 'relative',
                zIndex: 20 // Higher z-index to keep button on top
              }}
            >
              {showPipGenerator ? 'Show Card Table' : 'Show Pip Generator'}
            </button>
          </div>
        </div>
        
        {/* Show Pip Generator in a fixed position below the buttons */}
        {showPipGenerator && (
          <div style={{ 
            position: 'fixed',
            top: '100px', // Fixed position from top with enough space for buttons
            right: '24px',
            left: '24px',
            backgroundColor: 'white', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 15,
            padding: '10px',
            maxWidth: '1200px',
            margin: '0 auto',
            height: 'auto'
          }}>
            <PipPlacementGenerator onSave={handleSavePipPlacements} />
          </div>
        )}
        
        {/* Only show CardTable if pip generator is not visible */}
        {!showPipGenerator && (
          <CardTable cards={cards} onCardClick={onCardClick} />
        )}
      </div>
      <GoogleSignin />
    </div>
  )
}

export default App;