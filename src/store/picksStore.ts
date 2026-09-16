'use client';

import { create } from 'zustand';
import type { Pick, PickFilters } from '@/types/pick';
import type { AsyncState } from '@/types/api';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface PicksState {
  picks: Pick[];
  selectedPick: Pick | null;
  filters: PickFilters;
  asyncState: AsyncState<Pick[]>;

  // Actions
  setPicks: (picks: Pick[]) => void;
  addPick: (pick: Pick) => void;
  updatePick: (id: string, partial: Partial<Pick>) => void;
  removePick: (id: string) => void;
  setSelectedPick: (pick: Pick | null) => void;
  setFilters: (filters: Partial<PickFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AsyncState<Pick[]>['error']) => void;
}

const DEFAULT_FILTERS: PickFilters = {
  page: 1,
  limit: 10,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePicksStore = create<PicksState>()((set) => ({
  picks: [],
  selectedPick: null,
  filters: DEFAULT_FILTERS,
  asyncState: { data: null, status: 'idle', error: null },

  setPicks: (picks) =>
    set((state) => ({
      picks,
      asyncState: { ...state.asyncState, data: picks, status: 'success', error: null },
    })),

  addPick: (pick) => set((state) => ({ picks: [pick, ...state.picks] })),

  updatePick: (id, partial) =>
    set((state) => ({
      picks: state.picks.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),

  removePick: (id) =>
    set((state) => ({ picks: state.picks.filter((p) => p.id !== id) })),

  setSelectedPick: (pick) => set({ selectedPick: pick }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setLoading: (loading) =>
    set((state) => ({
      asyncState: { ...state.asyncState, status: loading ? 'loading' : 'idle' },
    })),

  setError: (error) =>
    set((state) => ({
      asyncState: { ...state.asyncState, status: 'error', error },
    })),
}));
