'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { AuthSession } from '@/types/user';

// ─── useAuth Hook ─────────────────────────────────────────────────────────────

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setSession, setLoading, logout, updateUser } =
    useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const session = await loginApi({ email, password });
        // setSession(session);
        console.log('Login attempt:', email, password);
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const session = await registerApi({ username, email, password });
        // setSession(session);
        console.log('Register attempt:', username, email, password);
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const restoreSession = useCallback(
    (session: AuthSession) => {
      setSession(session);
    },
    [setSession]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    restoreSession,
  };
}
