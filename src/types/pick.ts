// ─── Pick / Bet Types ──────────────────────────────────────────────────────────

import type { Match } from './sport';
import type { User } from './user';

export type PickResult = 'win' | 'loss' | 'push' | 'pending';
export type PickConfidence = 1 | 2 | 3 | 4 | 5;

export interface Pick {
  id: string;
  matchId: string;
  match?: Match;
  userId: string;
  user?: User;
  selection: string;          // e.g. "Home Win", "Over 2.5", "Team A -1.5"
  odds: number;               // decimal odds
  stake: number;              // amount wagered
  potentialReturn: number;    // stake * odds
  confidence: PickConfidence; // 1–5 stars
  result: PickResult;
  analysis?: string;          // optional written analysis
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickFormData {
  matchId: string;
  selection: string;
  odds: number;
  stake: number;
  confidence: PickConfidence;
  analysis?: string;
  isPublic: boolean;
}

export interface PickFilters {
  sport?: string;
  result?: PickResult;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
