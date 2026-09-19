// ─── App Routes ───────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Main App
  DASHBOARD: '/dashboard',
  PICKS: '/picks',
  PICK_DETAIL: (id: string) => `/picks/${id}`,
  LEADERBOARD: '/leaderboard',
  RETOS: '/retos',
  BOOKMAKERS: '/casas-de-apuestas',
  TELEGRAM: '/telegram',
  PROFILE: '/profile',
  PROFILE_USER: (username: string) => `/profile/${username}`,
  ADMIN: '/admin',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
