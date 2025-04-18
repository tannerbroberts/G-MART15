import React from 'react';
import '../App.css';

interface CardProps {
  size: 'large' | 'small';
  location: { x: number; y: number };
  cardBackImage: string;
  cardFrontImage: string;
  isFlipped: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  size,
  location,
  cardBackImage,
  cardFrontImage,
  isFlipped,
  onClick,
}) => {
  return (
    <div
      className={`card ${size} ${isFlipped ? 'flipped' : ''}`}
      style={{
        transform: `translate(${location.x}px, ${location.y}px)`,
      }}
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-front">
          <img src={cardFrontImage} alt="Card front" />
        </div>
        <div className="card-back">
          <img src={cardBackImage} alt="Card back" />
        </div>
      </div>
    </div>
  );
};

export default Card;
