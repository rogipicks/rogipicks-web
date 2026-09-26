import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_PICKS } from '@/lib/data/mockPicks';
import { getAllPicks } from '@/lib/db/picksDb';
import { formatOdds } from '@/lib/utils/formatters';
import { ROUTES } from '@/constants/routes';
import styles from './pickDetail.module.css';
import { PickDetailCard } from './PickDetailCard';
import { SharePickCard } from '@/components/features/picks/SharePickCard';
import { ChannelCard } from '@/components/features/telegram/ChannelCard';

interface PickDetailPageProps {
  params: Promise<{ id: string }>;
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

export async function generateMetadata({ params }: PickDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  let pick;
  try {
    const dbPicks = await getAllPicks();
    pick = dbPicks.find((p) => p.id === id);
  } catch {
    // fallback
  }
  if (!pick) {
    pick = MOCK_PICKS.find((p) => p.id === id);
  }
  return {
    title: pick ? `${pick.selection} — Pick #${id}` : `Pick #${id}`,
    description: pick?.analysis || `Detalle del pick deportivo #${id} en RogiPicks.`,
  };
}

export default async function PickDetailPage({ params }: PickDetailPageProps) {
  const { id } = await params;
  let pick;
  try {
    const dbPicks = await getAllPicks();
    pick = dbPicks.find((p) => p.id === id);
  } catch {
    // fallback
  }
  if (!pick) {
    pick = MOCK_PICKS.find((p) => p.id === id);
  }

  if (!pick) {
    notFound();
  }

  const homeTeam = pick.match?.homeTeam.name || 'Local';
  const awayTeam = pick.match?.awayTeam.name || 'Visitante';

    return (
    <div
      className={`container ${styles.detailContainer}`}
      style={{
        paddingTop: 'var(--space-4)',
        paddingBottom: 'var(--space-8)',
        maxWidth: '800px',
        scrollMarginTop: 'calc(var(--navbar-height) + var(--space-4))',
      }}
    >
      <Link
        href={ROUTES.PICKS}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-brand-300)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-6)',
          fontWeight: 600,
        }}
      >
        ← Volver a todos los picks
      </Link>

      <PickDetailCard pickId={pick.id} initialResult={pick.result}>
        {/* Botón de compartir (abre la tarjeta para redes / JPG) */}
        <SharePickCard pick={pick} />

        {/* Match Section (Fixture Layout) */}
        <div className={styles.matchSection}>
          {/* Home team */}
          <div className={styles.matchTeamSide}>
            <div className={styles.teamLogoBox}>
              {pick.match?.homeTeam.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pick.match.homeTeam.logoUrl}
                  alt={homeTeam}
                  className={`${styles.fixtureLogo} ${
                    pick.match.homeTeam.logoUrl.includes('flagcdn') || pick.match?.sport?.category === 'tennis'
                      ? styles.fixtureLogoFlag
                      : styles.fixtureLogoKit
                  }`}
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
                  className={`${styles.fixtureLogo} ${
                    pick.match.awayTeam.logoUrl.includes('flagcdn') || pick.match?.sport?.category === 'tennis'
                      ? styles.fixtureLogoFlag
                      : styles.fixtureLogoKit
                  }`}
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

        {/* Prediction Box */}
        <div style={{
          backgroundColor: 'var(--color-bg-elevated)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid var(--color-border)'
        }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Pronóstico Seleccionado
            </span>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
              {pick.selection}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Cuota Decimal</span>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--color-accent-400)' }}>
              {formatOdds(pick.odds)}
            </div>
          </div>
        </div>

        {/* Metrics: Probabilidad + Confianza */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          textAlign: 'center',
          paddingBlock: 'var(--space-4)',
          borderTop: '1px solid var(--color-border-soft)',
          borderBottom: '1px solid var(--color-border-soft)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '80px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Probabilidad
            </span>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'hsl(198 100% 60%)' }}>
              {pick.probability
                ? (pick.probability.toString().endsWith('%') ? pick.probability : `${pick.probability}%`)
                : (pick.odds ? `${Math.round(100 / pick.odds)}%` : '—')}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '80px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Confianza
            </span>
            <span style={{ color: 'var(--color-accent-400)', fontSize: 'var(--text-lg)', letterSpacing: '3px' }}>
              {'★'.repeat(pick.confidence)}{'☆'.repeat(5 - pick.confidence)}
            </span>
          </div>
        </div>

        {/* Analysis Section */}
        {pick.analysis && (
          <div>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Análisis del partido
            </h4>
            <p style={{
              backgroundColor: 'var(--color-bg-base)',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-md)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)'
            }}>
              {pick.analysis}
            </p>
          </div>
        )}

        {/* Extra Predictions Section */}
        {pick.extraPredictions && pick.extraPredictions.length > 0 && (
          <div>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
              Otros pronósticos del partido
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pick.extraPredictions.map((ep, i) => (
                <div key={ep.id || i} style={{
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-soft)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
                      {ep.bet}
                    </span>
                    <span style={{
                      fontWeight: 800,
                      color: 'var(--color-accent-400)',
                      fontSize: 'var(--text-sm)',
                      background: 'hsl(198 100% 50% / 0.12)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      Cuota {ep.odds}
                    </span>
                  </div>
                  {ep.analysis && (
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
                      {ep.analysis}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </PickDetailCard>

      {/* Bloque del canal de Telegram, justo debajo del pick */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <ChannelCard />
      </div>
    </div>
  );
}
