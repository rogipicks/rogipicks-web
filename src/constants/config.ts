// ─── App Configuration ────────────────────────────────────────────────────────

export const APP_CONFIG = {
  name: 'RogiPicks',
  description: 'La plataforma de picks deportivos más completa',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  version: '1.0.0',
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? 'https://t.me/+yRs5E_z6tt81NWE0',

  // Redes sociales (se muestran en la franja de redes del footer)
  tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? 'https://www.tiktok.com/@rogipicks_',
  twitterUrl: process.env.NEXT_PUBLIC_TWITTER_URL ?? 'https://x.com/RogiPicks_',
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/rogipicks',

  // Contacto legal (protección de datos / aviso legal)
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'rogipicks@gmail.com',
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
