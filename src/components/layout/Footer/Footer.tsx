import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>🎯 RogiPicks</span>
          <p className={styles.tagline}>{APP_CONFIG.description}</p>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          <div className={styles.col}>
            <span className={styles.colTitle}>App</span>
            <Link href={ROUTES.PICKS}>Picks</Link>
            <Link href={ROUTES.LEADERBOARD}>Ranking</Link>
            <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Cuenta</span>
            <Link href={ROUTES.LOGIN}>Entrar</Link>
            <Link href={ROUTES.REGISTER}>Registrarse</Link>
            <Link href={ROUTES.PROFILE}>Perfil</Link>
          </div>
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
