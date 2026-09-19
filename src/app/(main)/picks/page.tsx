import React from 'react';
import { MOCK_PICKS } from '@/lib/data/mockPicks';
import { PickList } from '@/components/features/picks/PickList';
import styles from './picks.module.css';

export default function PicksPage() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pronósticos Deportivos</h1>
        <p className={styles.subtitle}>
          Descubre y analiza las mejores cuotas y pronósticos de la comunidad.
        </p>
      </div>

      <PickList initialPicks={MOCK_PICKS} />
    </div>
  );
}
