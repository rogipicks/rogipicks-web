// ─── Sport & Match Types ───────────────────────────────────────────────────────

export type SportCategory = 'football' | 'basketball' | 'tennis' | 'baseball' | 'hockey' | 'ufc' | 'other';

export interface Sport {
  id: string;
  name: string;
  category: SportCategory;
  iconUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  sportId: string;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface Match {
  id: string;
  sport: Sport;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  odds: MatchOdds;
}

export interface MatchOdds {
  homeWin: number;
  draw?: number;
  awayWin: number;
  updatedAt: string;
}
