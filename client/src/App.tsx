import React, { useState } from 'react';
import './App.css';
import Card from './components/Card';
import cardBackImage from './images/cardback.png';
import cardFrontImage from './images/cardFront.png';

const App: React.FC = () => {
  const [location] = useState<{ x: number; y: number }>({ x: 100, y: 200 });
  const [size] = useState<'large' | 'small'>('large');
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="app">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ cursor: 'pointer' }}
      >
        <Card
          size={size}
          location={location}
          cardBackImage={cardBackImage}
          cardFrontImage={cardFrontImage}
          isFlipped={isFlipped}
        />
      </div>
    </div>
  );
};

export default App;