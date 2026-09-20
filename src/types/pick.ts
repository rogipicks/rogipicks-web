// ─── Pick / Bet Types ──────────────────────────────────────────────────────────

import type { Match } from './sport';
import type { User } from './user';

export type PickResult = 'win' | 'loss' | 'push' | 'pending';
export type PickConfidence = 1 | 2 | 3 | 4 | 5;
export type PodiumPosition = 1 | 2 | 3;

export interface SecondaryPrediction {
  id?: string;
  bet: string;          // Apuesta
  odds: number | string; // Cuota
  analysis?: string;    // Análisis de la apuesta secundaria
}

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
  probability?: string;       // e.g. "80%"
  result: PickResult;
  podium?: PodiumPosition | null; // posición en el podio del día (1º, 2º o 3º); null = sin podio
  analysis?: string;          // optional written analysis
  extraPredictions?: SecondaryPrediction[]; // otros pronósticos del partido
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
  extraPredictions?: SecondaryPrediction[];
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
