import Link from 'next/link';
import type { Reto } from '@/types/reto';
import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import {
  getRetoResult,
  getRetoProgress,
  STEP_RESULT_ICONS,
  STEP_RESULT_LABELS,
} from '@/lib/utils/retoStatus';
import styles from '@/app/(main)/retos/retos.module.css';

const TELEGRAM_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

export interface LatestRetosProps {
  retos: Reto[];
}

/**
 * "Últimos retos" para la home: los 3 retos más recientes publicados
 * con la misma tarjeta visual que /retos, pero sin el modal de pasos
 * (el cliente navega a /retos para ver todo).
 */
export function LatestRetos({ retos }: LatestRetosProps) {
  const sorted = [...retos].sort((a, b) => {
    const da = a.createdAt ?? a.updatedAt ?? '';
    const db = b.createdAt ?? b.updatedAt ?? '';
    return db.localeCompare(da);
  });
  const latest = sorted.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section className={styles.grid} aria-label="Últimos retos">
      {latest.map((reto) => {
        const result = getRetoResult(reto);
        const progress = getRetoProgress(reto);

        const cardClass =
          result === 'win'
            ? styles.cardWin
            : result === 'loss'
              ? styles.cardLoss
              : styles.cardPending;

        const badgeClass = `${styles.resultBadge} ${
          result === 'win'
            ? styles.badgeWin
            : result === 'loss'
              ? styles.badgeLoss
              : styles.badgePending
        }`;

        const telegramMode = reto.telegramMode === true;
        const telegramHref =
          (reto.telegramUrl || '').trim() || APP_CONFIG.telegramUrl;

        return (
                    <article key={reto.id} className={`${styles.card} ${cardClass}`}>
            {reto.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={reto.coverImage}
                alt={reto.title}
                className={styles.cardCover}
                loading="lazy"
              />
            )}

            {/* Badge de estado al estilo de los picks */}
            <span className={badgeClass}>
              {`${STEP_RESULT_ICONS[result]} ${STEP_RESULT_LABELS[result]}`}
            </span>

            <h2 className={styles.cardTitle}>
              <Link href={ROUTES.RETOS} className={styles.cardTitleLink}>
                {reto.title}
              </Link>
            </h2>
            <p className={styles.cardDesc}>{reto.desc}</p>

            <div className={styles.progressContainer}>
              <div className={styles.progressLabels}>
                <span className={styles.stepText}>{progress.stepLabel}</span>
                <span className={styles.progressPct}>{progress.pct}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Cantidad Inicial</span>
                <span className={styles.metaValue}>
                  {(reto.stake ?? '').replace(/\s*iniciales\s*$/i, '')}
                </span>
              </div>
              <span className={styles.metaArrow} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Objetivo</span>
                <span className={styles.metaHighlight}>{reto.currentBank}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              {telegramMode ? (
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.btnFollow} ${styles.btnFollowTelegram}`}
                >
                  <span className={styles.btnFollowIcon} aria-hidden="true">
                    {TELEGRAM_SVG}
                  </span>
                  <span>Sigue el reto en Telegram</span>
                </a>
              ) : (
                <Link href={ROUTES.RETOS} className={styles.btnFollow}>
                  <span className={styles.btnFollowIcon} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                  <span>Ver todos los retos →</span>
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
