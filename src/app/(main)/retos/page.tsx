import type { Metadata } from 'next';
import { getAllRetos } from '@/lib/db/retosDb';
import { RetosList } from './RetosList';
import styles from './retos.module.css';

export const metadata: Metadata = {
  title: 'Retos | RogiPicks',
  description: 'Participa en los retos exclusivos de RogiPicks: retos escalera, cuotas especiales y desafíos deportivos.',
};

export const dynamic = 'force-dynamic';

export default async function RetosPage() {
  const initialRetos = await getAllRetos();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <div className={styles.heroBadge}>
          <span>🏆 DESAFÍOS & RETOS EXCLUSIVOS</span>
        </div>
        <h1 className={styles.title}>
          Retos Deportivos <span className={styles.highlight}>RogiPicks</span>
        </h1>
        <p className={styles.subtitle}>
          Sigue nuestros retos en directo con gestión estricta de bankroll, cuotas verificadas y transparencia total.
        </p>
      </header>

      <RetosList initialRetos={initialRetos} />
    </div>
  );
}

