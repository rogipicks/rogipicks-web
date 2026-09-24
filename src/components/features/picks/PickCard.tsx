'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Pick } from '@/types/pick';
import { formatOdds } from '@/lib/utils/formatters';
import styles from './PickCard.module.css';

interface PickCardProps {
  pick: Pick;
}

function formatMatchDateTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return '';
  }
}

export const PickCard: React.FC<PickCardProps> = ({ pick }) => {
  const router = useRouter();
  const homeTeam = pick.match?.homeTeam.name || 'Local';
  const awayTeam = pick.match?.awayTeam.name || 'Visitante';

  const resultCardClass = {
    pending: styles.cardPending,
    win: styles.cardWin,
    loss: styles.cardLoss,
    push: styles.cardPush,
  }[pick.result] ?? styles.cardPending;

  const resultBadge = {
    pending: { cls: styles.badgePending, label: '⏳ Pendiente' },
    win: { cls: styles.badgeWin, label: '✅ Ganado' },
    loss: { cls: styles.badgeLoss, label: '❌ Perdido' },
    push: { cls: styles.badgePush, label: '⚪ Nulo' },
  }[pick.result] ?? { cls: styles.badgePending, label: '⏳ Pendiente' };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(`/picks/${pick.id}`, '_blank');
      return;
    }
    router.push(`/picks/${pick.id}`);
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1) {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) return;
      window.open(`/picks/${pick.id}`, '_blank');
    }
  };

  return (
    <div
      className={`${styles.card} ${resultCardClass}`}
      onClick={handleCardClick}
      onAuxClick={handleAuxClick}
      role="link"
      tabIndex={0}
      title="Ver detalles del pick"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          router.push(`/picks/${pick.id}`);
        }
      }}
    >
      {/* Result badge */}
      <span className={`${styles.resultBadge} ${resultBadge.cls}`}>
        {resultBadge.label}
      </span>
      {/* Match info */}
      <div className={styles.matchSection}>
        {/* Home team */}
        <div className={styles.matchTeamSide}>
          <div className={styles.teamLogoBox}>
            {pick.match?.homeTeam.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pick.match.homeTeam.logoUrl}
                alt={homeTeam}
                className={styles.fixtureLogo}
              />
            ) : (
              <span className={styles.logoLetter}>
                {homeTeam.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className={styles.teamName}>{homeTeam}</span>
        </div>

        {/* Center: Date/Time and Dash */}
        <div className={styles.matchCenter}>
          {pick.match?.competition && (
            <span className={styles.matchCompetition}>
              {pick.match.competition}
            </span>
          )}
          {pick.match?.startTime && (
            <span className={styles.matchDateTime}>
              {formatMatchDateTime(pick.match.startTime)}
            </span>
          )}
          <span className={styles.matchDash}>-</span>
        </div>

        {/* Away team */}
        <div className={styles.matchTeamSide}>
          <div className={styles.teamLogoBox}>
            {pick.match?.awayTeam.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pick.match.awayTeam.logoUrl}
                alt={awayTeam}
                className={styles.fixtureLogo}
              />
            ) : (
              <span className={styles.logoLetter}>
                {awayTeam.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className={styles.teamName}>{awayTeam}</span>
        </div>
      </div>

      {/* Prediction Selection */}
      <div className={styles.selectionBox}>
        <div className={styles.selectionInfo}>
          <span className={styles.selectionLabel}>Pronóstico</span>
          <span className={styles.selectionValue}>{pick.selection}</span>
        </div>
        <div className={styles.oddsBox}>
          <span className={styles.oddsLabel}>Cuota</span>
          <span className={styles.oddsValue}>{formatOdds(pick.odds)}</span>
        </div>
      </div>

      {/* Metrics (Probabilidad y Confianza) */}
      <div className={styles.metricsRow}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Probabilidad</span>
          <span className={`${styles.metricValue} ${styles.probabilityValue}`}>
            {pick.probability
              ? (pick.probability.toString().endsWith('%') ? pick.probability : `${pick.probability}%`)
              : (pick.odds ? `${Math.round(100 / pick.odds)}%` : '—')}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Confianza</span>
          <span className={styles.stars}>
            <span className={styles.starsOn}>{'★'.repeat(pick.confidence)}</span>
            <span className={styles.starsOff}>{'☆'.repeat(Math.max(0, 5 - pick.confidence))}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
