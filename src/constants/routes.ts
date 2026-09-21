// ─── App Routes ───────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  HOME: '/',

  // Main App
  PICKS: '/picks',
  PICK_DETAIL: (id: string) => `/picks/${id}`,
  LEADERBOARD: '/leaderboard',
  RETOS: '/retos',
  BOOKMAKERS: '/casas-de-apuestas',
  TELEGRAM: '/telegram',
  ADMIN: '/admin',

  // Compañía / información legal
  ABOUT: '/sobre-nosotros',
  CONTACT: '/contacto',
  USER_AGREEMENT: '/acuerdo-de-usuario',
  PRIVACY: '/politica-de-privacidad',
  COOKIES: '/politica-de-cookies',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
