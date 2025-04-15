import React from 'react';
import '../App.css';

interface CardProps {
  size: 'large' | 'small';
  location: { x: number; y: number };
  cardBackImage: string;
  cardFrontImage: string;
  isFlipped: boolean;
}

const Card: React.FC<CardProps> = ({ size, location, cardBackImage, cardFrontImage, isFlipped }) => {
  return (
    <div
      className={`card ${size}`}
      style={{
        transform: `translate(${location.x}px, ${location.y}px)`,
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {isFlipped ? <div className="card-back">
        <img src={cardBackImage} alt="Card back" />
      </div>:
      <div className="card-front">
        <img src={cardFrontImage} alt="Card front" />
      </div>}
    </div>
  );
};

export default Card;