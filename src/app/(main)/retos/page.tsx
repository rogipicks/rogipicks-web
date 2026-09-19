import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import styles from './retos.module.css';

export const metadata: Metadata = {
  title: 'Retos | RogiPicks',
  description: 'Participa en los retos exclusivos de RogiPicks: retos escalera, cuotas especiales y desafíos deportivos.',
};

const RETOS = [
  {
    id: 'reto-escalera',
    title: 'Reto Escalera: 10€ ➔ 500€',
    badge: 'En Progreso',
    badgeType: 'active',
    desc: 'Escalera de apuestas a cuota segura paso a paso. Publicamos cada pick antes del inicio del evento.',
    currentStep: 'Paso 4 de 7',
    progress: 57,
    stake: '10€ iniciales',
    currentBank: '84.50€',
    category: 'Fútbol Europeo',
  },
  {
    id: 'reto-fin-semana',
    title: 'Desafío Combinada Cuota 10.00',
    badge: 'Nuevo',
    badgeType: 'new',
    desc: 'Selección de 4 partidos analizados estadísticamente para el sábado y domingo.',
    currentStep: 'Inicia este Sábado',
    progress: 15,
    stake: 'Stake 1 (Controlado)',
    currentBank: 'Cuota: 10.45',
    category: 'Multideporte',
  },
  {
    id: 'reto-nba',
    title: 'Reto NBA 5/5 Player Props',
    badge: 'Especial',
    badgeType: 'special',
    desc: '5 jornadas consecutivas acertando pronósticos individuales de jugadores de la NBA.',
    currentStep: 'Paso 2 de 5',
    progress: 40,
    stake: 'Stake 2',
    currentBank: 'Acierto 100%',
    category: 'Baloncesto NBA',
  },
];

export default function RetosPage() {
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

      <div className={styles.grid}>
        {RETOS.map((reto) => (
          <article key={reto.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.category}>{reto.category}</span>
              <span className={`${styles.badge} ${styles[reto.badgeType]}`}>{reto.badge}</span>
            </div>

            <h2 className={styles.cardTitle}>{reto.title}</h2>
            <p className={styles.cardDesc}>{reto.desc}</p>

            <div className={styles.progressContainer}>
              <div className={styles.progressLabels}>
                <span className={styles.stepText}>{reto.currentStep}</span>
                <span className={styles.progressPct}>{reto.progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${reto.progress}%` }} />
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Stake / Inicio</span>
                <span className={styles.metaValue}>{reto.stake}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Estado actual</span>
                <span className={styles.metaHighlight}>{reto.currentBank}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Link href={ROUTES.TELEGRAM} className={styles.btnFollow}>
                <span>Seguir reto en Telegram</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
