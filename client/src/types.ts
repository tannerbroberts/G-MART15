export type PlayerStatus = 'active' | 'smoke_break' | 'pending_game_start';

export interface Player {
  id: string;
  name: string;
  seatNumber: number;
  status: PlayerStatus;
  chips: number;
}

export interface TableState {
  id: string;
  players: Player[];
  currentHandId: string | null;
  isGameActive: boolean;
}
export type CardData = {
  id: string;
  location: { x: number; y: number };
  size: 'large' | 'small';
  cardBackImage: string;
  cardFrontImage: string;
  isFlipped: boolean;
};
