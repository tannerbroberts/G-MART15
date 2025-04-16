import React, { useState } from 'react';
import './App.css';
import Card from './components/Card';
import cardBackImage from './images/cardback.png';
import cardFrontImage from './images/cardFront.png';
import LoginPage from './LoginPage';
import { generateCardSVG } from './cardGenerator';

type CardData = {
  id: string;
  location: { x: number; y: number };
  size: 'large' | 'small';
  cardBackImage: string;
  cardFrontImage: string;
  isFlipped: boolean;
};

const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

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

// New CardSelector component
const CardSelector: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('A');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24 }}>
      <div role="radiogroup" aria-label="Card Value Selector" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {values.map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="card-value"
              value={value}
              checked={selectedValue === value}
              onChange={() => setSelectedValue(value)}
            />
            {value}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {suits.map((suit) => (
          <div key={suit} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, background: '#fff' }}>
            <div dangerouslySetInnerHTML={{ __html: generateCardSVG(suit, selectedValue as any) }} />
            <div style={{ textAlign: 'center', marginTop: 4 }}>{suit}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
      <div className="card-table">
        <LoginPage />
        <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
          <CardSelector />
        </div>
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
