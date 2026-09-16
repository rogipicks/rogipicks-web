'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePicksStore } from '@/store/picksStore';
import type { Pick, PickFilters } from '@/types/pick';

// ─── usePicks Hook ────────────────────────────────────────────────────────────

export function usePicks(initialFilters?: PickFilters) {
  const {
    picks,
    filters,
    asyncState,
    setPicks,
    addPick,
    updatePick,
    removePick,
    setFilters,
    resetFilters,
    setLoading,
    setError,
  } = usePicksStore();

  const [hasFetched, setHasFetched] = useState(false);

  const fetchPicks = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call once backend is ready
      // const data = await getPicks(filters);
      // setPicks(data);
      setPicks([]); // placeholder
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Error al cargar picks',
        status: 500,
      });
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [filters, setPicks, setLoading, setError]);

  useEffect(() => {
    if (initialFilters) setFilters(initialFilters);
    fetchPicks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    picks,
    filters,
    isLoading: asyncState.status === 'loading',
    isError: asyncState.status === 'error',
    error: asyncState.error,
    hasFetched,
    addPick,
    updatePick: (id: string, data: Partial<Pick>) => updatePick(id, data),
    removePick,
    setFilters,
    resetFilters,
    refresh: fetchPicks,
  };
}
