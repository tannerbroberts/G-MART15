// components/CardPair.tsx
import React from 'react';
import Card from './Card';

interface CardPairProps {
  cards: Array<{
    id: string;
    location: { x: number; y: number };
    size: 'large' | 'small';
    cardBackImage: string;
    cardFrontImage: string;
    isFlipped: boolean;
  }>;
  onCardClick?: (id: string) => void;
}

const CardPair: React.FC<CardPairProps> = ({ cards, onCardClick }) => {
  if (cards.length !== 2) {
    console.warn('CardPair requires exactly 2 cards');
    return null;
  }

  return (
    <div className="card-pair">
      {cards.map((card) => (
        <Card
          key={card.id}
          size={card.size}
          location={card.location}
          cardBackImage={card.cardBackImage}
          cardFrontImage={cardFrontImage}
          isFlipped={card.isFlipped}
          onClick={() => onCardClick?.(card.id)}
        />
      ))}
    </div>
  );
};

export default CardPair;
