import './App.css'
import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './loginpage';
import CardSelector from './components/CardSelector';
import CardTable from './components/CardTable';
import PipPlacementGenerator from './components/PipPlacementGenerator';
import { initialCards } from './initialCards';
import { handleCardClick } from './utils';
import { PipPlacementMap } from './cardGenerator';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import MenuPage from './menupage';
import JoinGamePage from './joingamepage';
import UsernamePage from './usernamepage';

const GameComponent: React.FC = () => {
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
    <div className="card-table">
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
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className='appcontainer'>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/username" element={
              <ProtectedRoute>
                <UsernamePage />
              </ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            } />
            <Route path="/join-game" element={
              <ProtectedRoute>
                <JoinGamePage />
              </ProtectedRoute>
            } />
            <Route path="/game" element={
              <ProtectedRoute>
                <GameComponent />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;