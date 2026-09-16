'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_PICKS } from '@/lib/data/mockPicks';
import { PickCard } from '@/components/features/picks/PickCard';
import { Modal } from '@/components/ui/Modal/Modal';
import { PickForm, type NewPickFormData } from '@/components/features/picks/PickForm';
import { ROUTES } from '@/constants/routes';
import type { Pick } from '@/types/pick';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [picks, setPicks] = useState<Pick[]>(MOCK_PICKS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePick = (data: NewPickFormData) => {
    const newPick: Pick = {
      id: `pick-${Date.now()}`,
      matchId: `m-${Date.now()}`,
      userId: 'u-1',
      user: {
        id: 'u-1',
        username: 'TuUsuario',
        email: 'user@rogipicks.com',
        role: 'tipster',
        createdAt: new Date().toISOString(),
      },
      match: {
        id: `m-${Date.now()}`,
        sport: {
          id: `s-${data.sportCategory}`,
          name: data.sportCategory.toUpperCase(),
          category: data.sportCategory as any,
        },
        homeTeam: {
          id: 't-h',
          name: data.matchTeams.split('vs')[0]?.trim() || data.matchTeams,
          shortName: 'LOC',
          sportId: `s-${data.sportCategory}`,
        },
        awayTeam: {
          id: 't-a',
          name: data.matchTeams.split('vs')[1]?.trim() || 'Rival',
          shortName: 'VIS',
          sportId: `s-${data.sportCategory}`,
        },
        startTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        odds: {
          homeWin: data.odds,
          awayWin: 2.1,
          updatedAt: new Date().toISOString(),
        },
      },
      selection: data.selection,
      odds: data.odds,
      stake: data.stake,
      potentialReturn: Number((data.stake * data.odds).toFixed(2)),
      confidence: data.confidence,
      result: 'pending',
      analysis: data.analysis,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPicks([newPick, ...picks]);
    setIsModalOpen(false);
  };

  const pendingPicks = picks.filter((p) => p.result === 'pending');
  const finishedPicks = picks.filter((p) => p.result !== 'pending');
  const wonPicks = finishedPicks.filter((p) => p.result === 'win');
  const winRate = finishedPicks.length > 0
    ? Math.round((wonPicks.length / finishedPicks.length) * 100)
    : 72;

  return (
    <div className={`container ${styles.dashboard}`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel de Control 📊</h1>
          <p className={styles.subtitle}>
            Seguimiento de rendimiento, rentabilidad y picks activos en tiempo real.
          </p>
        </div>
        <button
          type="button"
          className={styles.publishBtn}
          onClick={() => setIsModalOpen(true)}
        >
          + Publicar Pick
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Beneficio Neto</span>
            <span className={styles.statIcon}>💰</span>
          </div>
          <span className={styles.statValue} style={{ color: 'var(--color-success-400)' }}>
            +38.50u
          </span>
          <span className={`${styles.statTrend} ${styles.trendPositive}`}>
            ▲ +14.2% este mes
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Win Rate</span>
            <span className={styles.statIcon}>🎯</span>
          </div>
          <span className={styles.statValue}>{winRate}%</span>
          <span className={`${styles.statTrend} ${styles.trendPositive}`}>
            ▲ 5% sobre la media
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Yield / ROI</span>
            <span className={styles.statIcon}>📈</span>
          </div>
          <span className={styles.statValue} style={{ color: 'var(--color-accent-400)' }}>
            +21.4%
          </span>
          <span className={`${styles.statTrend} ${styles.trendPositive}`}>
            ▲ Cuota media 1.88
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Picks Activos</span>
            <span className={styles.statIcon}>⏳</span>
          </div>
          <span className={styles.statValue}>{pendingPicks.length}</span>
          <span className={styles.statTrend}>
            {picks.length} picks históricos
          </span>
        </div>
      </div>

      {/* Analytics & Sport Breakdown */}
      <div className={styles.analyticsSection}>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Evolución de Rendimiento</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Gráfico de unidades acumuladas en los últimos 30 días de actividad:
          </p>
          <div style={{
            height: '180px',
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            gap: '8px',
          }}>
            {[20, 35, 25, 45, 60, 50, 75, 70, 85, 95].map((height, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${height}%`,
                  background: 'linear-gradient(180deg, var(--color-brand-400), var(--color-brand-600))',
                  borderRadius: '4px',
                  transition: 'height 0.3s ease',
                }}
                title={`Día ${idx + 1}: +${(height * 0.4).toFixed(1)}u`}
              />
            ))}
          </div>
        </div>

        <div className={styles.breakdownCard}>
          <h2 className={styles.cardTitle}>Porcentajes por Deporte</h2>
          <div className={styles.breakdownList}>
            <div className={styles.breakdownItem}>
              <div className={styles.breakdownMeta}>
                <span className={styles.breakdownSport}>⚽ Fútbol</span>
                <span className={styles.breakdownPercentage}>55%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${styles.fillFb}`} style={{ width: '55%' }} />
              </div>
            </div>

            <div className={styles.breakdownItem}>
              <div className={styles.breakdownMeta}>
                <span className={styles.breakdownSport}>🏀 Baloncesto NBA</span>
                <span className={styles.breakdownPercentage}>30%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${styles.fillBk}`} style={{ width: '30%' }} />
              </div>
            </div>

            <div className={styles.breakdownItem}>
              <div className={styles.breakdownMeta}>
                <span className={styles.breakdownSport}>🎾 Tenis ATP</span>
                <span className={styles.breakdownPercentage}>15%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${styles.fillTn}`} style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Picks */}
      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2 className={styles.recentTitle}>Últimos Picks Publicados</h2>
          <Link href={ROUTES.PICKS} className={styles.viewAll}>
            Ver todos los picks →
          </Link>
        </div>

        <div className={styles.picksRow}>
          {picks.slice(0, 3).map((pick) => (
            <PickCard key={pick.id} pick={pick} />
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publicar Nuevo Pronóstico 🎯"
      >
        <PickForm
          onSubmit={handleCreatePick}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
