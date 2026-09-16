import type { Metadata } from 'next';
import { LeaderboardTable } from '@/components/features/leaderboard/LeaderboardTable';
import { MOCK_TIPSTERS } from '@/lib/data/mockTipsters';

export const metadata: Metadata = {
  title: 'Ranking de Tipsters',
  description: 'Descubre a los mejores tipsters y pronosticadores clasificados por ROI y beneficio.',
};

export default function LeaderboardPage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--font-extrabold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)'
        }}>
          Ranking Oficial de Tipsters 🏆
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
          Clasificación transparente y auditada basada en el rendimiento, yield y unidades ganadas.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Tipster Nº 1 del Mes
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '20px' }}>🥇</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
              @{MOCK_TIPSTERS[0].username}
            </span>
          </div>
          <span style={{ color: 'var(--color-success-400)', fontWeight: 700, fontSize: 'var(--text-sm)', display: 'block', marginTop: '4px' }}>
            +{MOCK_TIPSTERS[0].profitUnits} unidades generadas
          </span>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Mejor Win Rate
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '20px' }}>🎯</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
              {MOCK_TIPSTERS[0].winRate}%
            </span>
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', display: 'block', marginTop: '4px' }}>
            En {MOCK_TIPSTERS[0].totalPicks} pronósticos verificados
          </span>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Yield Promedio Top 5
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '20px' }}>📈</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-accent-400)' }}>
              +19.1%
            </span>
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', display: 'block', marginTop: '4px' }}>
            Rentabilidad sobre capital apostado
          </span>
        </div>
      </div>

      <LeaderboardTable tipsters={MOCK_TIPSTERS} />
    </div>
  );
}
