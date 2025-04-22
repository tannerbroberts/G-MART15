import React from 'react';
import Card from './Card';
import { CardData } from '../types';

type CardTableProps = {
  cards: CardData[];
  onCardClick: (id: string) => void;
};

const CardTable: React.FC<CardTableProps> = ({ cards, onCardClick }) => (
  <>
    {cards.map(card => (
      <div key={card.id} onClick={() => onCardClick(card.id)} style={{ cursor: 'pointer', position: 'absolute', left: card.location.x, top: card.location.y }}>
        <Card {...card} location={{ x: 0, y: 0 }} />
      </div>
    ))}
  </>
);

export default CardTable;
