export interface TipsterLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  totalPicks: number;
  winRate: number; // e.g. 74.2%
  profitUnits: number; // e.g. +48.3u
  roi: number; // e.g. 23.4%
  streak: string; // e.g. "WWWLW"
  bestSport: string;
}

export const MOCK_TIPSTERS: TipsterLeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'u-1',
    username: 'ElMagoDelBalon',
    totalPicks: 248,
    winRate: 74.5,
    profitUnits: 58.4,
    roi: 24.1,
    streak: 'WWWWW',
    bestSport: 'Fútbol',
  },
  {
    rank: 2,
    userId: 'u-2',
    username: 'HoopMaster',
    totalPicks: 195,
    winRate: 71.0,
    profitUnits: 43.8,
    roi: 20.8,
    streak: 'WWLWW',
    bestSport: 'Baloncesto NBA',
  },
  {
    rank: 3,
    userId: 'u-3',
    username: 'AceTennis',
    totalPicks: 160,
    winRate: 68.2,
    profitUnits: 36.2,
    roi: 18.5,
    streak: 'LWWWW',
    bestSport: 'Tenis ATP',
  },
  {
    rank: 4,
    userId: 'u-4',
    username: 'OctagonStriker',
    totalPicks: 112,
    winRate: 66.7,
    profitUnits: 29.5,
    roi: 17.2,
    streak: 'WWLWL',
    bestSport: 'UFC',
  },
  {
    rank: 5,
    userId: 'u-5',
    username: 'UnderdogKing',
    totalPicks: 310,
    winRate: 59.4,
    profitUnits: 27.1,
    roi: 15.0,
    streak: 'LWWLW',
    bestSport: 'Fútbol',
  },
];
