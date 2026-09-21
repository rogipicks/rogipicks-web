import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';
import { COMPANY_LINKS } from '@/constants/company';
import styles from './Footer.module.css';

/** Icono oficial de Telegram (mismo path que usan Navbar y home). */
function TelegramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

/** Icono de TikTok (silueta oficial). */
function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/** Icono de X (antes Twitter), logo oficial actual. */
function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Icono de Instagram (trazo, para casar con el UI del sitio). */
function InstagramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** Redes sociales: sólo el logo, sin nombre ni usuario. */
const SOCIALS = [
  {
    name: 'TikTok',
    label: 'Picks en vídeo, resultados y directos',
    href: APP_CONFIG.tiktokUrl,
    icon: <TikTokIcon />,
    accent: styles.socialTiktok,
  },
  {
    name: 'X',
    label: 'Avisos en directo y cuotas del día',
    href: APP_CONFIG.twitterUrl,
    icon: <XIcon />,
    accent: styles.socialTwitter,
  },
  {
    name: 'Instagram',
    label: 'Comunidad, sorteos y resúmenes',
    href: APP_CONFIG.instagramUrl,
    icon: <InstagramIcon />,
    accent: styles.socialInstagram,
  },
] as const;





/**
 * Footer de la web: marca con el logo real (logo.png), accesos al contenido,
 * una línea con las 3 redes sociales, la franja legal (protección de datos,
 * juego responsable y normativa de juego online) y el único botón al canal de
 * Telegram, que es el objetivo principal de conversión del sitio.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Halos decorativos, mismo lenguaje visual que el resto de secciones */}
      <span className={styles.glowTop} aria-hidden="true" />
      <span className={styles.glowSide} aria-hidden="true" />

      <div className={styles.inner}>
        {/* ─── Marca + llamada a la acción ─── */}
        <div className={styles.brand}>
          <Link href={ROUTES.HOME} className={styles.logoLink} aria-label="RogiPicks - Inicio">
            <Image
              src="/images/logo.png"
              alt="RogiPicks"
              width={165}
              height={114}
              className={styles.logo}
            />
          </Link>

          <p className={styles.tagline}>
            Pronósticos deportivos con datos, análisis y transparencia total. Gratis, para siempre.
          </p>

          <ul className={styles.chips}>
            <li className={`${styles.chip} ${styles.chipFree}`}>✓ Gratis</li>
            <li className={styles.chip}>Sin spam</li>
            <li className={styles.chip}>Avisos en directo</li>
          </ul>

          <a
            href={APP_CONFIG.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            <TelegramIcon />
            <span>Únete gratis al canal</span>
          </a>
          <span className={styles.ctaNote}>Recibe cada pick al instante · Puedes salir cuando quieras</span>
        </div>

        {/* ─── Contenido + Compañía (arriba) y Síguenos debajo ─── */}
        <div className={styles.navWrap}>
          <nav className={styles.col} aria-label="Contenido">
            <h2 className={styles.colTitle}>Contenido</h2>
            <Link href={ROUTES.PICKS} className={styles.link}>
              Pronósticos
            </Link>
            <Link href={ROUTES.RETOS} className={styles.link}>
              Retos
            </Link>
            <Link href={ROUTES.BOOKMAKERS} className={styles.link}>
              Casas de apuestas
            </Link>
          </nav>

          <nav className={styles.col} aria-label="Compañía">
            <h2 className={styles.colTitle}>Información</h2>
            {COMPANY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.socialBlock}>
            <h2 className={styles.colTitle}>Síguenos</h2>
            <ul className={styles.socials}>
              {SOCIALS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.social} ${social.accent}`}
                    aria-label={`${social.name} de RogiPicks — ${social.label}`}
                    title={`${social.name} · ${social.label}`}
                  >
                    <span className={styles.socialIcon}>{social.icon}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Franja inferior ─── */}
      <div className={styles.bottom}>
        <p>© {year} RogiPicks. Todos los derechos reservados.</p>
        <p className={styles.disclaimer}>
          <span className={styles.ageBadge}>+18</span>
          El juego puede crear adicción. Juega con responsabilidad.
        </p>
      </div>
    </footer>
  );
}
