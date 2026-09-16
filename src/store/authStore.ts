'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthSession } from '@/types/user';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (session: AuthSession) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setSession: (session) =>
        set({
          user: session.user,
          token: session.accessToken,
          isAuthenticated: true,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'rogipicks-auth',
      // Only persist user and token, not loading state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
