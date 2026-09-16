import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_PICKS } from '@/lib/data/mockPicks';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatOdds, formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ROUTES } from '@/constants/routes';

interface PickDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PickDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const pick = MOCK_PICKS.find((p) => p.id === id);
  return {
    title: pick ? `${pick.selection} — Pick #${id}` : `Pick #${id}`,
    description: pick?.analysis || `Detalle del pick deportivo #${id} en RogiPicks.`,
  };
}

export default async function PickDetailPage({ params }: PickDetailPageProps) {
  const { id } = await params;
  const pick = MOCK_PICKS.find((p) => p.id === id) || MOCK_PICKS[0];

  if (!pick) {
    notFound();
  }

  const getResultBadge = () => {
    switch (pick.result) {
      case 'win':
        return <Badge variant="success">✅ Pronóstico Acertado</Badge>;
      case 'loss':
        return <Badge variant="danger">❌ Pronóstico Fallado</Badge>;
      case 'push':
        return <Badge variant="warning">⚪ Pronóstico Nulo</Badge>;
      case 'pending':
      default:
        return <Badge variant="primary">⏳ En Juego / Pendiente</Badge>;
    }
  };

  return (
    <div className="container" style={{ paddingBlock: 'var(--space-8)', maxWidth: '800px' }}>
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

      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 'var(--text-sm)'
            }}>
              {pick.user?.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                @{pick.user?.username}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Publicado el {formatDate(pick.createdAt)}
              </span>
            </div>
          </div>
          <div>{getResultBadge()}</div>
        </div>

        {/* Match Header */}
        <div style={{
          backgroundColor: 'var(--color-bg-base)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid var(--color-border-soft)'
        }}>
          <span style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            color: 'var(--color-accent-400)',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            {pick.match?.sport.name}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBlock: 'var(--space-3)',
            fontSize: 'var(--text-xl)',
            fontWeight: 800,
            color: 'var(--color-text-primary)'
          }}>
            <span>{pick.match?.homeTeam.name}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>VS</span>
            <span>{pick.match?.awayTeam.name}</span>
          </div>
          {pick.match?.startTime && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Fecha del evento: {new Date(pick.match.startTime).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
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

        {/* Stake and Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-4)',
          textAlign: 'center',
          paddingBlock: 'var(--space-4)',
          borderTop: '1px solid var(--color-border-soft)',
          borderBottom: '1px solid var(--color-border-soft)',
        }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Stake Asignado
            </span>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {pick.stake} / 10u
            </span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Retorno Potencial
            </span>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-success-400)' }}>
              {formatCurrency(pick.potentialReturn, 'EUR')}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Nivel de Confianza
            </span>
            <span style={{ color: 'var(--color-accent-400)', fontSize: 'var(--text-base)' }}>
              {'★'.repeat(pick.confidence)}{'☆'.repeat(5 - pick.confidence)}
            </span>
          </div>
        </div>

        {/* Analysis Section */}
        {pick.analysis && (
          <div>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Análisis y Justificación del Tipster
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
      </div>
    </div>
  );
}
