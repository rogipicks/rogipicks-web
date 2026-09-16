'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Pick } from '@/types/pick';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatOdds, formatCurrency, formatDate } from '@/lib/utils/formatters';
import styles from './PickCard.module.css';

interface PickCardProps {
  pick: Pick;
}

export const PickCard: React.FC<PickCardProps> = ({ pick }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const getResultBadge = () => {
    switch (pick.result) {
      case 'win':
        return <Badge variant="success">✅ Acertada</Badge>;
      case 'loss':
        return <Badge variant="danger">❌ Fallada</Badge>;
      case 'push':
        return <Badge variant="warning">⚪ Nula</Badge>;
      case 'pending':
      default:
        return <Badge variant="primary">⏳ Pendiente</Badge>;
    }
  };

  const sportName = pick.match?.sport.name || 'Deporte';
  const homeTeam = pick.match?.homeTeam.name || 'Local';
  const awayTeam = pick.match?.awayTeam.name || 'Visitante';

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.author}>
          <div className={styles.avatar}>
            {pick.user?.username?.substring(0, 2).toUpperCase() || 'TP'}
          </div>
          <div>
            <span className={styles.username}>@{pick.user?.username || 'tipster'}</span>
            <span className={styles.date}>{formatDate(pick.createdAt)}</span>
          </div>
        </div>
        <div className={styles.metaBadge}>
          <span className={styles.sportTag}>{sportName}</span>
          {getResultBadge()}
        </div>
      </div>

      {/* Match info */}
      <div className={styles.matchSection}>
        <div className={styles.matchTeams}>
          <span className={styles.team}>{homeTeam}</span>
          <span className={styles.vs}>vs</span>
          <span className={styles.team}>{awayTeam}</span>
        </div>
        {pick.match?.startTime && (
          <span className={styles.matchTime}>
            📅 {new Date(pick.match.startTime).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
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

      {/* Metrics (Stake, Return, Confidence) */}
      <div className={styles.metricsRow}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Stake</span>
          <span className={styles.metricValue}>{pick.stake} / 10u</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Retorno Est.</span>
          <span className={`${styles.metricValue} ${styles.return}`}>
            {formatCurrency(pick.potentialReturn, 'EUR')}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Confianza</span>
          <span className={styles.stars}>
            {'★'.repeat(pick.confidence)}
            {'☆'.repeat(5 - pick.confidence)}
          </span>
        </div>
      </div>

      {/* Analysis Accordion */}
      {pick.analysis && (
        <div className={styles.analysisContainer}>
          <button
            type="button"
            className={styles.analysisToggle}
            onClick={() => setShowAnalysis(!showAnalysis)}
          >
            {showAnalysis ? 'Ocultar análisis ▴' : 'Ver análisis del Tipster ▾'}
          </button>
          {showAnalysis && (
            <p className={styles.analysisText}>{pick.analysis}</p>
          )}
        </div>
      )}

      {/* Footer link */}
      <div className={styles.footer}>
        <Link href={`/picks/${pick.id}`} className={styles.detailLink}>
          Detalles del pick →
        </Link>
      </div>
    </div>
  );
};
