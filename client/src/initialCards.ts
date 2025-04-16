import { CardData } from './types';
import cardBackImage from './images/cardback.png';
import cardFrontImage from './images/cardFront.png';

export const initialCards: CardData[] = [
  { id: 'card1', location: { x: 100, y: 200 }, size: 'large', cardBackImage, cardFrontImage, isFlipped: false },
  { id: 'card2', location: { x: 300, y: 200 }, size: 'large', cardBackImage, cardFrontImage, isFlipped: false },
];
