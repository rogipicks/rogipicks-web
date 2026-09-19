import React from 'react';
import type { PickResult } from '@/types/pick';

const RESULT_META: Record<string, {
  borderColor: string;
  boxShadow: string;
  badgeBg: string;
  badgeColor: string;
  label: string;
}> = {
  pending: {
    borderColor: 'hsl(35 95% 55%)',
    boxShadow: '0 0 0 1px hsl(35 95% 55% / 0.25), 0 4px 24px hsl(35 95% 55% / 0.14)',
    badgeBg: 'hsl(35 95% 55%)',
    badgeColor: 'hsl(25 100% 10%)',
    label: '⏳ Pendiente',
  },
  win: {
    borderColor: 'hsl(145 65% 48%)',
    boxShadow: '0 0 0 1px hsl(145 65% 48% / 0.25), 0 4px 24px hsl(145 65% 48% / 0.14)',
    badgeBg: 'hsl(145 65% 48%)',
    badgeColor: 'hsl(145 60% 8%)',
    label: '✅ Ganado',
  },
  loss: {
    borderColor: 'hsl(0 75% 55%)',
    boxShadow: '0 0 0 1px hsl(0 75% 55% / 0.25), 0 4px 24px hsl(0 75% 55% / 0.14)',
    badgeBg: 'hsl(0 75% 55%)',
    badgeColor: '#fff',
    label: '❌ Perdido',
  },
  push: {
    borderColor: 'hsl(215 30% 50%)',
    boxShadow: '0 0 0 1px hsl(215 30% 50% / 0.2), 0 4px 24px hsl(215 30% 50% / 0.1)',
    badgeBg: 'hsl(215 30% 50%)',
    badgeColor: '#fff',
    label: '⚪ Nulo',
  },
};

interface PickDetailCardProps {
  pickId?: string;
  result?: PickResult;
  initialResult?: PickResult;
  children: React.ReactNode;
}

export function PickDetailCard({ result, initialResult, children }: PickDetailCardProps) {
  const currentResult = result ?? initialResult ?? 'pending';
  const meta = RESULT_META[currentResult] ?? RESULT_META['pending'];

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-surface)',
      border: `2px solid ${meta.borderColor}`,
      boxShadow: meta.boxShadow,
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-8)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      position: 'relative',
    }}>
      {/* Result badge top-right */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: meta.badgeBg,
          color: meta.badgeColor,
          borderRadius: '0 var(--radius-xl) 0 var(--radius-lg)',
          padding: '7px 16px',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          lineHeight: 1,
          zIndex: 2,
          userSelect: 'none',
        }}
      >
        {meta.label}
      </span>

      {children}
    </div>
  );
}
