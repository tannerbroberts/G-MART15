import { CardData } from './types';

export function handleCardClick(cards: CardData[], id: string): CardData[] {
  return cards.map(card => card.id === id ? { ...card, isFlipped: !card.isFlipped } : card);
}
