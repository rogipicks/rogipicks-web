import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { formatOdds } from '@/lib/utils/formatters';
import type { Pick } from '@/types/pick';
import styles from './BestOfDayPodium.module.css';

type PodiumTone = 'stepGold' | 'stepSilver' | 'stepBronze';

// Orden visual del podio: 2º (izquierda), 1º (centro, más alto), 3º (derecha)
const PODIUM_STEPS: { position: 1 | 2 | 3; tone: PodiumTone }[] = [
  { position: 2, tone: 'stepSilver' },
  { position: 1, tone: 'stepGold' },
  { position: 3, tone: 'stepBronze' },
];

// Metadatos por resultado (mismo estilo que la tarjeta de detalle)
const RESULT_META: Record<Pick['result'], { card: string; badge: string; label: string }> = {
  win: { card: styles.cardWin, badge: styles.badgeWin, label: '✅ Ganado' },
  pending: { card: styles.cardPending, badge: styles.badgePending, label: '⏳ Pendiente' },
  loss: { card: styles.cardLoss, badge: styles.badgeLoss, label: '❌ Perdido' },
  push: { card: styles.cardPush, badge: styles.badgePush, label: '⚪ Nulo' },
};

/** Fecha en formato dd.mm.aaaa hh:mm (como en el detalle) */
function formatWhen(source: string | undefined): string {
  if (!source) return '—';
  try {
    const d = new Date(source);
    if (isNaN(d.getTime())) return '—';
    const p = (n: number) => String(n).padStart(2, '0');
    return (
      p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
    );
  } catch {
    return '—';
  }
}

function TeamLogo({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <span className={styles.logoBox}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className={styles.logoImg} loading="lazy" />
      ) : (
        <span className={styles.logoLetter}>{name.slice(0, 3).toUpperCase()}</span>
      )}
    </span>
  );
}

function PodiumPickCard({ pick }: { pick: Pick }) {
  const home = pick.match?.homeTeam?.name || 'Local';
  const away = pick.match?.awayTeam?.name || 'Visitante';
  const meta = RESULT_META[pick.result] ?? RESULT_META.pending;
  const when = formatWhen(pick.match?.startTime || pick.createdAt);
  const hasOdds = typeof pick.odds === 'number' && !isNaN(pick.odds);
  const odds = hasOdds ? formatOdds(pick.odds) : '—';
  // Probabilidad definida o implícita por la cuota (100 / cuota)
  const probability =
    pick.probability || (hasOdds ? Math.round((100 / pick.odds) * 10) / 10 + '%' : '—');
  const confidence = pick.confidence ?? 3;
  const starsOn = '★'.repeat(confidence);
  const starsOff = '☆'.repeat(Math.max(0, 5 - confidence));

  return (
    <Link
      href={ROUTES.PICK_DETAIL(pick.id)}
      className={styles.card + ' ' + meta.card}
      aria-label={'Ver pick ' + home + ' vs ' + away}
    >
      {/* Badge de resultado en la esquina (como en el detalle) */}
      <span className={styles.cardBadge + ' ' + meta.badge}>{meta.label}</span>

      {/* Panel del partido: logos en cajas blancas + fecha en cian */}
      <div className={styles.matchPanel}>
        <div className={styles.panelRow}>
          <TeamLogo name={home} logoUrl={pick.match?.homeTeam?.logoUrl} />
          <span className={styles.matchWhen}>{when}</span>
          <TeamLogo name={away} logoUrl={pick.match?.awayTeam?.logoUrl} />
        </div>
        <div className={styles.teamsRow}>
          <span className={styles.teamName}>{home}</span>
          <span className={styles.dash}>–</span>
          <span className={styles.teamName}>{away}</span>
        </div>
      </div>

      {/* Fila de pronóstico + cuota */}
      <div className={styles.predictionRow}>
        <div className={styles.predictionLeft}>
          <span className={styles.metaLabel}>Pronóstico</span>
          <span className={styles.selection}>{pick.selection || 'Pick destacado'}</span>
        </div>
        <div className={styles.predictionRight}>
          <span className={styles.metaLabel}>Cuota</span>
          <span className={styles.oddsValue}>{odds}</span>
        </div>
      </div>

      {/* Métricas: probabilidad + confianza */}
      <div className={styles.metricsRow}>
        <div className={styles.metricBox}>
          <span className={styles.metaLabel}>Probabilidad</span>
          <span className={styles.metricValue}>{probability}</span>
        </div>
        <div className={styles.metricBox}>
          <span className={styles.metaLabel}>Confianza</span>
          <span className={styles.stars}>
            <span className={styles.starsOn}>{starsOn}</span>
            <span className={styles.starsOff}>{starsOff}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Podio "Las mejores apuestas del día".
 * `positions` contiene el pick de cada posición: [1º, 2º, 3º] (null si está vacía).
 */
export function BestOfDayPodium({ positions }: { positions: readonly (Pick | null)[] }) {
  return (
    <section className={styles.section} aria-label="Las mejores apuestas del día">
      <div className={'container ' + styles.inner}>
        <div className={styles.header}>
          <span className={styles.headerBadge} aria-hidden="true">🏆</span>
          <h2 className={styles.title}>
            Las mejores apuestas <span className={styles.titleAccent}>del día</span>
          </h2>
          <p className={styles.subtitle}>
            Los picks destacados por RogiPicks, ordenados por podio.
          </p>
        </div>

        <div className={styles.podium}>
          {PODIUM_STEPS.map(({ position, tone }) => {
            const pick = positions[position - 1] ?? null;
            return (
              <div key={position} className={styles.step + ' ' + styles[tone]}>
                {pick ? (
                  <PodiumPickCard pick={pick} />
                ) : (
                  <div className={styles.emptyCard}>Sin pick</div>
                )}
                <div className={styles.base}>
                  <span className={styles.position}>{position}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}