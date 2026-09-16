import type { User, AuthSession } from '@/types/user';

// Mock session helper for client & server components
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const session = localStorage.getItem('rogipicks_session');
  if (!session) return null;

  try {
    return JSON.parse(session) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(user: User, token: string, expiresAt: string): void {
  if (typeof window === 'undefined') return;

  const session: AuthSession = {
    user,
    accessToken: token,
    token,
    expiresAt,
  };
  localStorage.setItem('rogipicks_session', JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('rogipicks_session');
}
