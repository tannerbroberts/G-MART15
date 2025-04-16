import React, { useState } from 'react';
import './App.css';
import Card from './components/Card';
import cardBackImage from './images/cardback.png';
import cardFrontImage from './images/cardFront.png';
import LoginPage from './LoginPage';
type CardData = {
  id: string;
  location: { x: number; y: number };
  size: 'large' | 'small';
  cardBackImage: string;
  cardFrontImage: string;
  isFlipped: boolean;
};

const initialCards: CardData[] = [
  {
    id: 'card1',
    location: { x: 100, y: 200 },
    size: 'large',
    cardBackImage,
    cardFrontImage,
    isFlipped: false,
  },
  {
    id: 'card2',
    location: { x: 300, y: 200 },
    size: 'large',
    cardBackImage,
    cardFrontImage,
    isFlipped: false,
  },
];

const App: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>(initialCards);

  const handleCardClick = (id: string) => {
    setCards(cards =>
      cards.map(card =>
        card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
      )
    );
  };

  return (
    <div className='appcontainer'>
    <LoginPage />

    <div className="card-table">
      {cards.map(card => (
        <div
          key={card.id}
          onClick={() => handleCardClick(card.id)}
          style={{ cursor: 'pointer', position: 'absolute', left: card.location.x, top: card.location.y }}
        >
          <Card
            size={card.size}
            location={{ x: 0, y: 0 }} // Already positioned by parent div
            cardBackImage={card.cardBackImage}
            cardFrontImage={card.cardFrontImage}
            isFlipped={card.isFlipped}
          />
        </div>
      ))}
    </div>
    </div>
  );
};

export default App;
