import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Logo centered in the middle of footer */}
        <div className={styles.brandCenter}>
          <Link href={ROUTES.HOME} className={styles.logoLink} aria-label="RogiPicks - Inicio">
            <div className={styles.logoBadge}>
              <Image
                src="/images/logo.jpg"
                alt="RogiPicks Mascot Logo"
                width={96}
                height={96}
                className={styles.logoImg}
              />
            </div>
            <div className={styles.logoText}>
              <span>ROGI</span><strong>PICKS</strong>
            </div>
          </Link>
          <p className={styles.tagline}>{APP_CONFIG.description}</p>
        </div>

        {/* Centered navigation links */}
        <nav className={styles.linksRow} aria-label="Navegación del footer">
          <Link href={ROUTES.PICKS} className={styles.link}>Picks</Link>
          <Link href={ROUTES.LEADERBOARD} className={styles.link}>Ranking</Link>
          <Link href={ROUTES.DASHBOARD} className={styles.link}>Dashboard</Link>
          <span className={styles.dot}>•</span>
          <Link href={ROUTES.LOGIN} className={styles.link}>Entrar</Link>
          <Link href={ROUTES.REGISTER} className={styles.link}>Registrarse</Link>
          <Link href={ROUTES.PROFILE} className={styles.link}>Perfil</Link>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p>© {year} RogiPicks. Todos los derechos reservados.</p>
        <p className={styles.disclaimer}>
          El juego puede crear adicción. Juega con responsabilidad. +18
        </p>
      </div>
    </footer>
  );
}
