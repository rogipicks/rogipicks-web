import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge/Badge';

export const metadata: Metadata = {
  title: 'Mi Perfil | RogiPicks',
  description: 'Gestiona tu perfil de tipster, bankroll y configuración de cuenta.',
};

export default function ProfilePage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-8)', maxWidth: '900px' }}>
      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 'var(--text-xl)'
          }}>
            RP
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Roger Picks
              </h1>
              <Badge variant="warning">⭐ Tipster Pro</Badge>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '2px' }}>
              @rogerpicks • Miembro desde Septiembre 2024
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600
          }}>
            ⚙️ Editar Perfil
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'var(--space-6)'
      }}>
        {/* Bankroll info */}
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
        }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            💼 Gestión de Bankroll
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Bank Inicial:</span>
              <span style={{ fontWeight: 600 }}>1.000,00 €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Bank Actual:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-success-400)' }}>1.385,00 € (+38.5%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Valor 1 Unidad (1u):</span>
              <span style={{ fontWeight: 600 }}>10,00 € (1%)</span>
            </div>
          </div>
        </div>

        {/* Account preferences */}
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
        }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            🔔 Notificaciones
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" defaultChecked /> Alertas de picks de tipsters seguidos
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" defaultChecked /> Avisos de cuotas con valor (value bets)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" defaultChecked /> Resumen semanal de rendimiento por email
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
