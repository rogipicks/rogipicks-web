'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Match } from '@/types/sport';

// ─── useOdds Hook ─────────────────────────────────────────────────────────────

interface UseOddsOptions {
  matchId?: string;
  pollInterval?: number; // ms, 0 = no polling
}

export function useOdds({ matchId, pollInterval = 0 }: UseOddsOptions = {}) {
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOdds = useCallback(async () => {
    if (!matchId) return;
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const data = await getMatch(matchId);
      // setMatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuotas');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchOdds();

    if (pollInterval > 0) {
      const interval = setInterval(fetchOdds, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchOdds, pollInterval]);

  return {
    match,
    odds: match?.odds ?? null,
    isLoading,
    error,
    refresh: fetchOdds,
  };
}
