import React, { useState } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import CardSelector from './components/CardSelector';
import CardTable from './components/CardTable';
import { initialCards } from './initialCards';
import { handleCardClick } from './utils';

const App: React.FC = () => {
  const [cards, setCards] = useState(initialCards);
  const onCardClick = (id: string) => setCards(cards => handleCardClick(cards, id));
  return (
    <div className='appcontainer'>
      <div className="card-table">
        <LoginPage />
        <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
          <CardSelector />
        </div>
        <CardTable cards={cards} onCardClick={onCardClick} />
      </div>
    </div>
  );
};

export default App;
