// ─── User Types ───────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'bettor' | 'tipster' | 'analyst' | 'guest';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  balance?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  bio?: string;
  totalPicks: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  token?: string;
  expiresAt: string;
}
