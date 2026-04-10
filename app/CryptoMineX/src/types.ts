export interface Ticket {
  id: string;
  owner: string;
  numbers: number[];
  timestamp: number;
  isWinner?: boolean;
}

export interface LotteryState {
  jackpot: number;
  participants: number;
  endTime: number;
  ticketPrice: number;
  winningNumbers?: number[];
  isDrawCompleted: boolean;
}

export interface Winner {
  address: string;
  prize: number;
  matchingNumbers: number;
}
