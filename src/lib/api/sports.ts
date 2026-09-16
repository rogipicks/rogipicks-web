// ─── Sports API Client ────────────────────────────────────────────────────────

import { http } from './http';
import { SPORTS_API } from '@/constants/config';
import type { Match, Sport } from '@/types/sport';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

const BASE = SPORTS_API.BASE_URL;

/**
 * Fetches all available sports
 */
export async function getSports(): Promise<Sport[]> {
  const response = await http.get<ApiResponse<Sport[]>>(`${BASE}/sports`);
  return response.data;
}

/**
 * Fetches upcoming matches, optionally filtered by sport
 */
export async function getMatches(filters?: {
  sport?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Match>> {
  return http.get<PaginatedResponse<Match>>(`${BASE}/matches`, { params: filters });
}

/**
 * Fetches a single match by ID
 */
export async function getMatch(id: string): Promise<Match> {
  const response = await http.get<ApiResponse<Match>>(`${BASE}/matches/${id}`);
  return response.data;
}

/**
 * Fetches live matches
 */
export async function getLiveMatches(): Promise<Match[]> {
  const response = await http.get<ApiResponse<Match[]>>(`${BASE}/matches/live`);
  return response.data;
}
