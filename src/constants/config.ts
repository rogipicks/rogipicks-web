// ─── App Configuration ────────────────────────────────────────────────────────

export const APP_CONFIG = {
  name: 'RogiPicks',
  description: 'La plataforma de picks deportivos más completa',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  version: '1.0.0',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const PICK_CONFIG = {
  MIN_ODDS: 1.01,
  MAX_ODDS: 1000,
  MIN_STAKE: 1,
  MAX_STAKE: 100000,
  CONFIDENCE_LEVELS: [1, 2, 3, 4, 5] as const,
} as const;

export const SPORTS_API = {
  BASE_URL: process.env.NEXT_PUBLIC_SPORTS_API_URL ?? '',
  API_KEY: process.env.SPORTS_API_KEY ?? '',
} as const;
