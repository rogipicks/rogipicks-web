'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Pick } from '@/types/pick';
import { PickCard } from './PickCard';
import { DatePill } from './DatePill';
import { getLocalPicks, subscribeToPicks, saveLocalPicks } from '@/lib/utils/picksSync';
import styles from './PickList.module.css';

interface PickListProps {
  initialPicks: Pick[];
}

function getPickDate(pick: Pick): string {
  const dateSource = pick.match?.startTime || pick.createdAt;
  if (!dateSource) return '';
  try {
    const d = new Date(dateSource);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

export const PickList: React.FC<PickListProps> = ({
  initialPicks,
}) => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dbPicks, setDbPicks] = useState<Pick[]>(initialPicks);

  // Fecha seleccionada con DatePill (empieza en 20/09/2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 8, 20));
  const [showAllDates, setShowAllDates] = useState<boolean>(false);

  // Carga picks desde la API / Base de datos (fuente de verdad: refleja añadidos y borrados)
  const fetchPicks = async () => {
    try {
      const res = await fetch('/api/picks', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDbPicks(json.data);
          saveLocalPicks(json.data);
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching picks from API:', err);
    }
    setDbPicks(initialPicks);
  };

  useEffect(() => {
    // Escucha cambios inmediatos desde el Admin (en cualquier pestaña)
    const unsubscribe = subscribeToPicks((latestPicks) => {
      setDbPicks(latestPicks);
    });

    fetchPicks();

    const onFocus = () => fetchPicks();
    window.addEventListener('focus', onFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const sports = [
    { id: 'all', label: 'Todos los Deportes' },
    { id: 'football', label: '⚽ Fútbol' },
    { id: 'basketball', label: '🏀 Baloncesto' },
    { id: 'tennis', label: '🎾 Tenis' },
    { id: 'darts', label: '🎯 Dardos' },
  ];

  const selectedDateStr = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    setShowAllDates(false);
  };

  const filteredPicks = useMemo(() => {
    return dbPicks.filter((pick) => {
      // Date filter (unless showAllDates is active)
      if (!showAllDates) {
        const pickDate = getPickDate(pick);
        if (pickDate !== selectedDateStr) {
          return false;
        }
      }
      // Sport filter
      if (selectedSport !== 'all' && pick.match?.sport.category !== selectedSport) {
        return false;
      }
      // Result filter
      if (selectedResult !== 'all' && pick.result !== selectedResult) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const home = pick.match?.homeTeam.name.toLowerCase() || '';
        const away = pick.match?.awayTeam.name.toLowerCase() || '';
        const selection = pick.selection.toLowerCase();
        const username = pick.user?.username.toLowerCase() || '';
        if (
          !home.includes(query) &&
          !away.includes(query) &&
          !selection.includes(query) &&
          !username.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [dbPicks, showAllDates, selectedDateStr, selectedSport, selectedResult, searchQuery]);

  return (
    <div className={styles.container}>
      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por equipo, tipster o selección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterActions}>
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className={styles.selectFilter}
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">⏳ Pendientes</option>
            <option value="win">✅ Acertadas</option>
            <option value="loss">❌ Falladas</option>
          </select>
        </div>
      </div>

      {/* Sports Categories & Compact DatePill Row */}
      <div className={styles.sportsRow}>
        <div className={styles.sportsTabs}>
          {sports.map((sport) => (
            <button
              key={sport.id}
              type="button"
              className={`${styles.tabBtn} ${
                selectedSport === sport.id ? styles.tabBtnActive : ''
              }`}
              onClick={() => setSelectedSport(sport.id)}
            >
              {sport.label}
            </button>
          ))}
        </div>

        {/* Date Navigator Pill exactly as in user image */}
        <DatePill
          currentDate={currentDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Picks Grid */}
      {filteredPicks.length > 0 ? (
        <div className={styles.grid}>
          {filteredPicks.map((pick) => (
            <PickCard key={pick.id} pick={pick} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3 className={styles.emptyTitle}>
            No hay pronósticos para esta fecha
          </h3>
          <p className={styles.emptyDesc}>
            No se encontraron pronósticos para el día seleccionado. Puedes navegar a otros días con las flechas o{' '}
            <button
              type="button"
              style={{
                color: 'hsl(198 100% 50%)',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setShowAllDates(true)}
            >
              ver todos los pronósticos
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
};
