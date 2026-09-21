import Image from 'next/image';
import { APP_CONFIG } from '@/constants/config';
import styles from './ChannelCard.module.css';

/**
 * Convierte la URL del canal en un handle legible (@rogipicks).
 * Misma lógica que la página de Telegram para no duplicar formatos distintos.
 */
function getTelegramHandle(url: string): string {
  const match = url.match(/(?:t\.me|telegram\.me)\/(.+)$/i);
  const slug = match?.[1]?.replace(/\/+$/, '');
  if (!slug || slug.startsWith('+') || slug.startsWith('joinchat')) return 'Canal oficial';
  return `@${slug.replace(/^@/, '')}`;
}

const TELEGRAM_HANDLE = getTelegramHandle(APP_CONFIG.telegramUrl);

interface ChannelCardProps {
  /** Texto del único botón: enlace directo al canal de Telegram. */
  ctaLabel?: string;
}

/**
 * Tarjeta del canal de Telegram con el logo de marca, el nombre del canal, el
 * estado "En directo" y un único botón para unirse. Reutiliza el mismo diseño
 * que la cabecera de la página `/telegram`, pero pensada para insertarse en
 * otras páginas (por ejemplo, al final del detalle de un pick).
 */
export function ChannelCard({ ctaLabel = 'Unirme a Telegram' }: ChannelCardProps) {
  return (
    <article className={styles.card}>
      {/* Logo del proyecto, sin caja de fondo */}
      <div className={styles.logoRow}>
        <Image
          src="/images/logo.png"
          alt="RogiPicks"
          width={165}
          height={114}
          className={styles.logo}
        />
      </div>

      {/* Identidad del canal */}
      <div className={styles.meta}>
        <div className={styles.nameRow}>
          <h2 className={styles.name}>Canal RogiPicks</h2>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            En directo
          </span>
        </div>
        <span className={styles.handle}>{TELEGRAM_HANDLE}</span>
      </div>

      {/* Descripción */}
      <p className={styles.text}>
        Entra al canal para no perderte ningún pick publicado y hablar con otros tipsters.
        Publicamos con cuota, stake y análisis para que sepas siempre el porqué de cada pronóstico.
      </p>

      {/* Único botón: unirse al canal */}
      <div className={styles.actions}>
        <a
          href={APP_CONFIG.telegramUrl}
          className={styles.cta}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
          <span>{ctaLabel}</span>
        </a>
      </div>
    </article>
  );
}