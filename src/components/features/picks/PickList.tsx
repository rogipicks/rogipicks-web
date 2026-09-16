'use client';

import React, { useState, useMemo } from 'react';
import type { Pick } from '@/types/pick';
import { PickCard } from './PickCard';
import styles from './PickList.module.css';

interface PickListProps {
  initialPicks: Pick[];
  onOpenCreateModal?: () => void;
}

export const PickList: React.FC<PickListProps> = ({
  initialPicks,
  onOpenCreateModal,
}) => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sports = [
    { id: 'all', label: 'Todos los Deportes' },
    { id: 'football', label: '⚽ Fútbol' },
    { id: 'basketball', label: '🏀 Baloncesto' },
    { id: 'tennis', label: '🎾 Tenis' },
    { id: 'ufc', label: '🥊 UFC' },
  ];

  const filteredPicks = useMemo(() => {
    return initialPicks.filter((pick) => {
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
  }, [initialPicks, selectedSport, selectedResult, searchQuery]);

  return (
    <div className={styles.container}>
      {/* Filters Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
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

          {onOpenCreateModal && (
            <button
              type="button"
              className={styles.createBtn}
              onClick={onOpenCreateModal}
            >
              + Nuevo Pick
            </button>
          )}
        </div>
      </div>

      {/* Sport Category Tabs */}
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
          <h3 className={styles.emptyTitle}>No se encontraron picks</h3>
          <p className={styles.emptyDesc}>
            Prueba a cambiar los filtros o publica el primer pronóstico de este evento.
          </p>
        </div>
      )}
    </div>
  );
};
