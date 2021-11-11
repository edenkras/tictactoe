export enum GameStatus {
  Playing,
  HostWon,
  GuestWon,
  Tie,
}

export interface GameCreation {
  guest: string;
  firstMoveIndex: number;
}

export interface GameMove {
  gameId: string;
  index: number;
}
