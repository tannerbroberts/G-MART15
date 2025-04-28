import React from "react";
import Card from "./Card";
import { CardData } from "../types";

interface CardPairProps {
  cards: [CardData, CardData]; // Explicitly require exactly two cards
  onCardClick?: (id: string) => void;
}

const CardPair: React.FC<CardPairProps> = ({ cards, onCardClick }) => {
  if (cards.length !== 2) {
    console.warn("CardPair requires exactly 2 cards");
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
          cardFrontImage={card.cardFrontImage}
          isFlipped={card.isFlipped}
          onClick={() => onCardClick?.(card.id)}
        />
      ))}
    </div>
  );
};

export default CardPair;
