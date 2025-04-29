export type CardData = {
  id: string;
  location: { x: number; y: number };
  size: 'large' | 'small';
  cardBackImage: string;
  cardFrontImage: string;
  isFlipped: boolean;
};
