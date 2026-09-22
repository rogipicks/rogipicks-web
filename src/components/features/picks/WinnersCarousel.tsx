'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Pick } from '@/types/pick';
import { ROUTES } from '@/constants/routes';
import { formatOdds } from '@/lib/utils/formatters';
import styles from './WinnersCarousel.module.css';

interface WinnersCarouselProps {
  picks: Pick[];
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
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

/* Paso entre tarjetas: ancho (112px) + separación (16px) */
const CARD_PITCH = 128;
/* Velocidad constante de desplazamiento (px/s) */
const SPEED_PX_PER_S = 32;
/* Tope de tarjetas por mitad para no inflar el DOM */
const MAX_HALF_CARDS = 60;

/**
 * Carrusel con movimiento automático hacia la derecha (bucle infinito).
 * Tarjetas cuadradas: logo local — tic verde — logo visitante, con los nombres
 * y la cuota del pick debajo.
 * Pausa al pasar el mouse. Cada tarjeta enlaza al detalle del pick.
 */
export function WinnersCarousel({ picks }: WinnersCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [minViewport, setMinViewport] = useState(1920);

  // Medimos el ancho real del contenedor para que la mitad duplicada de la
  // pista cubra SIEMPRE toda la pantalla: así nunca se ve un hueco vacío
  // ni al cargar ni en ningún punto del bucle.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    const update = () => {
      // Redondeo por encima en pasos de 480px para no reiniciar la
      // animación con cada micro-cambio de tamaño de ventana.
      const step = Math.ceil(el.clientWidth / 480) * 480;
      setMinViewport((prev) => Math.max(prev, step));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (picks.length === 0) return null;

  // Repetimos la lista las veces necesarias para que una mitad cubra el ancho
  // visible (bucle perfecto, sin huecos ni saltos en pantallas grandes).
  const repeats = Math.max(
    1,
    Math.min(
      Math.ceil(minViewport / (CARD_PITCH * picks.length)),
      Math.ceil(MAX_HALF_CARDS / picks.length),
    ),
  );
  const half: Pick[] = [];
  for (let i = 0; i < repeats; i += 1) half.push(...picks);

  const trackItems = [...half, ...half];
  // Velocidad constante independientemente de cuántas tarjetas haya
  const durationSec = Math.max(20, Math.round((half.length * CARD_PITCH) / SPEED_PX_PER_S));

  return (
    <div
      ref={viewportRef}
      className={styles.carousel}
      role="region"
      aria-label="Últimos picks ganados"
    >
      <div
        className={styles.track}
        style={{ '--marquee-duration': `${durationSec}s` } as CSSProperties}
      >
        {trackItems.map((pick, i) => {
          const home = pick.match?.homeTeam;
          const away = pick.match?.awayTeam;
          const homeName = home?.shortName || home?.name || 'Local';
          const awayName = away?.shortName || away?.name || 'Visitante';
          const hasOdds = typeof pick.odds === 'number' && !isNaN(pick.odds);

          return (
            <Link
              key={`${pick.id}-${i}`}
              href={ROUTES.PICK_DETAIL(pick.id)}
              className={styles.card}
              title={`Ver pick: ${homeName} - ${awayName}`}
              aria-label={`Pick ganado: ${homeName} contra ${awayName}. Ver detalle`}
            >
              <span className={styles.logosRow}>
                <TeamLogo name={homeName} logoUrl={home?.logoUrl} />
                <span className={styles.check} aria-hidden="true">
                  <CheckIcon />
                </span>
                <TeamLogo name={awayName} logoUrl={away?.logoUrl} />
              </span>
              <span className={styles.names}>
                <span className={styles.nameSide}>{homeName}</span>
                <span className={styles.nameDash}>-</span>
                <span className={styles.nameSide}>{awayName}</span>
              </span>
              {/* Cuota del pick (misma convención que PickCard: 2.50x) */}
              <span className={styles.odds}>
                {hasOdds ? formatOdds(pick.odds) : '—'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}