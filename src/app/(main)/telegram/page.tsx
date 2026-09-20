import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WinsCarousel } from '@/components/features/telegram/WinsCarousel';
import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import styles from './telegram.module.css';

export const metadata: Metadata = {
  title: 'Telegram',
  description: 'Únete al canal de Telegram de RogiPicks para recibir pronósticos y novedades.',
};

/**
 * El carrusel lee las capturas del disco, así que la página se renderiza en cada
 * petición: si subes una foto nueva a `public/images/ganados`, aparece al recargar
 * sin necesidad de reconstruir el proyecto.
 */
export const dynamic = 'force-dynamic';

/** Icono oficial de Telegram (mismo path que usan la Navbar y la home). */
function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

/** Icono de trazo, siguiendo el estilo de la Navbar y de la home. */
function StrokeIcon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Convierte la URL del canal en un handle legible (@rogipicks). */
function getTelegramHandle(url: string): string {
  const match = url.match(/(?:t\.me|telegram\.me)\/(.+)$/i);
  const slug = match?.[1]?.replace(/\/+$/, '');
  if (!slug || slug.startsWith('+') || slug.startsWith('joinchat')) return 'Canal oficial';
  return `@${slug.replace(/^@/, '')}`;
}

const TELEGRAM_HANDLE = getTelegramHandle(APP_CONFIG.telegramUrl);

/**
 * Carpeta pública donde se suben las capturas de pronósticos ganados.
 * Las fotos se leen del disco en el servidor, así que basta con dejarlas ahí:
 * aparecerán en el carrusel sin tocar código.
 */
const WINS_DIR = path.join(process.cwd(), 'public', 'images', 'ganados');
const WINS_EXT = /\.(png|jpe?g|webp|avif|gif)$/i;

/** Rutas públicas de las capturas subidas, ordenadas por nombre de fichero. */
function getWinShots(): string[] {
  try {
    return fs
      .readdirSync(WINS_DIR)
      .filter((file) => !file.startsWith('.') && WINS_EXT.test(file))
      .sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }))
      .map((file) => `/images/ganados/${encodeURIComponent(file)}`);
  } catch {
    // La carpeta todavía no existe: el carrusel muestra su estado vacío.
    return [];
  }
}

const CHIPS = ['Gratis', 'Sin spam', 'Avisos en directo', 'Comunidad activa'];
const BENEFITS: { icon: ReactNode; title: string; text: string }[] = [
  {
    title: 'Picks al instante',
    text: 'Cada pronóstico se publica con su cuota, stake y análisis en cuanto sale el pick.',
    icon: (
      <StrokeIcon>
        <path d="M22 2 11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </StrokeIcon>
    ),
  },
  {
    title: 'Comunidad 24/7',
    text: 'Mensajes y apoyo a cualquier hora: comparte tus dudas en el chat y el equipo y la comunidad te responden todos los días.',
    icon: (
      <StrokeIcon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </StrokeIcon>
    ),
  },
  {
    title: 'Retos y seguimiento',
    text: 'Sigue los retos del bankroll paso a paso y recibe cada actualización en el canal.',
    icon: (
      <StrokeIcon>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </StrokeIcon>
    ),
  },
];

const STEPS: { title: string; text: string }[] = [
  {
    title: 'Descarga Telegram',
    text: 'Gratis en iOS, Android, escritorio y web. No necesitas compartir tu número con nadie más.',
  },
  {
    title: 'Pulsa «Unirme a Telegram»',
    text: 'El botón abre el canal directamente. También puedes buscar el handle dentro de la app.',
  },
  {
    title: 'Activa las notificaciones',
    text: 'Mantén el canal sin silenciar y recibirás cada pick y cada alerta al momento.',
  },
];


const FAQ: { q: string; a: string }[] = [
  {
    q: '¿Cuesta algo entrar al canal?',
    a: 'No, el acceso al canal principal es 100% gratuito. Puedes unirte, seguir las publicaciones y aprovechar la información diaria sin ningún tipo de cuota mensual ni compromiso.',
  },
  {
    q: '¿Necesito un bankroll alto o experiencia previa?',
    a: 'Para nada. El contenido está adaptado tanto para principiantes como para expertos. Además, explicamos en cada pick el stake (porcentaje de tu capital a apostar) recomendado para que gestiones tu dinero de forma segura sin importar cuánto invertas.',
  },
  {
    q: '¿Con qué frecuencia se publican picks?',
    a: 'Publicamos análisis diariamente, según la disponibilidad de partidos con valor real. Si en una jornada no detectamos oportunidades claras que cumplan nuestros criterios, preferimos no publicar antes que lanzar pronósticos sin fundamento.',
  },
  {
    q: '¿Cómo hacéis el seguimiento de los resultados?',
    a: 'Con total transparencia. Llevamos un registro detallado e historial de todas las jugadas enviadas para verificar el rendimiento real y mantener la confianza de la comunidad mes a mes.',
  },
  {
    q: '¿Puedo salir del canal cuando quiera?',
    a: 'Sí, libremente. No hay permanencia de ningún tipo. Tienes la opción de entrar, probar el contenido y salir en el momento que desees con un solo clic.',
  },
];

export default function TelegramPage() {
  // Capturas de picks ganados leídas en el servidor desde `public/images/ganados`.
  const winShots = getWinShots();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Telegram</h1>
        <p className={styles.subtitle}>
          Recibe los pronósticos al momento, alertas de partidos y el contacto directo con la
          comunidad RogiPicks.
        </p>

        <ul className={styles.chips}>
          {CHIPS.map((chip) => (
            <li key={chip} className={styles.chip}>
              {chip}
            </li>
          ))}
        </ul>
      </header>

      {/* ── Tarjeta del canal ── */}
      <section className={styles.hero}>
        <article className={styles.heroCard}>
          {/* Fila 1: logo del proyecto, sin caja de fondo */}
          <div className={styles.channelLogoRow}>
            <Image
              src="/images/logo.png"
              alt="RogiPicks"
              width={165}
              height={114}
              className={styles.channelLogo}
              priority
            />
          </div>

          {/* Fila 2: identidad del canal */}
          <div className={styles.channelMeta}>
            <div className={styles.channelNameRow}>
              <h2 className={styles.channelName}>Canal RogiPicks</h2>
              <span className={styles.liveBadge}>
                <span className={styles.liveDot} aria-hidden="true" />
                En directo
              </span>
            </div>
            <span className={styles.channelHandle}>{TELEGRAM_HANDLE}</span>
          </div>

          {/* Fila 3: descripción del canal */}
          <p className={styles.channelText}>
            Entra al canal para no perderte ningún pick publicado y hablar con otros tipsters.
            Publicamos con cuota, stake y análisis para que sepas siempre el porqué de cada
            pronóstico.
          </p>

          <div className={styles.heroActions}>
            <a
              href={APP_CONFIG.telegramUrl}
              className={styles.cta}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TelegramIcon size={18} />
              <span>Unirme a Telegram</span>
            </a>
            <Link href={ROUTES.PICKS} className={styles.ctaGhost}>
              <span>Ver pronósticos</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </article>
      </section>

      {/* ── Pronósticos ganados en el canal ─ */}
      <section className={`${styles.section} ${styles.winsSection}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Pronósticos Ganados en RogiPicks</h2>
          <p className={styles.sectionSubtitle}>
            Capturas reales de picks que cerramos en verde y publicamos en el canal de Telegram.
          </p>
        </div>

        <WinsCarousel images={winShots} />
      </section>

      {/* ── Qué recibes al entrar ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Qué recibes al entrar</h2>
          <p className={styles.sectionSubtitle}>
            Contenido pensado para que sigas cada pick con criterio y sin perder tiempo.
          </p>
        </div>

        <div className={styles.benefitsGrid}>
          {BENEFITS.map((benefit) => (
            <article key={benefit.title} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{benefit.icon}</span>
              <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              <p className={styles.benefitText}>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>


      {/* ── Cómo unirte en tres pasos ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Cómo unirte en tres pasos</h2>
          <p className={styles.sectionSubtitle}>
            Menos de un minuto y sin registros adicionales ni datos personales de más.
          </p>
        </div>

        <ol className={styles.stepsGrid}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.stepItem}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Preguntas frecuentes ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
          <p className={styles.sectionSubtitle}>
            Lo que suelen preguntar antes de entrar al canal.
          </p>
        </div>

        <div className={styles.faqList}>
          {FAQ.map((item) => (
            <details key={item.q} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                <span>{item.q}</span>
                <svg
                  className={styles.faqChevron}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className={styles.faqAnswer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Llamada a la acción final ── */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandGlow} aria-hidden="true" />
        <div className={styles.ctaBandContent}>
          <h2 className={styles.ctaBandTitle}>¿Te unes al canal?</h2>
          <p className={styles.ctaBandText}>
            Es gratis, puedes salir cuando quieras y recibirás cada pronóstico en el momento en
            que se publica.
          </p>
          <div className={styles.ctaBandActions}>
            <a
              href={APP_CONFIG.telegramUrl}
              className={styles.cta}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TelegramIcon size={18} />
              <span>Unirme a Telegram</span>
            </a>
            <Link href={ROUTES.RETOS} className={styles.ctaGhost}>
              <span>Ver los retos</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
