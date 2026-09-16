'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import styles from './Navbar.module.css';

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href={ROUTES.HOME} className={styles.logo} aria-label="RogiPicks - Inicio">
          <span className={styles.logoIcon}>🎯</span>
          <span className={styles.logoText}>
            Rogi<strong>Picks</strong>
          </span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Navegación principal">
          <Link href={ROUTES.PICKS} className={styles.navLink}>Picks</Link>
          <Link href={ROUTES.LEADERBOARD} className={styles.navLink}>Ranking</Link>
          <Link href={ROUTES.DASHBOARD} className={styles.navLink}>Dashboard</Link>
        </nav>

        {/* Auth */}
        <div className={styles.actions}>
          <Link href={ROUTES.LOGIN} className={styles.btnLogin}>
            Entrar
          </Link>
          <Link href={ROUTES.REGISTER} className={styles.btnRegister}>
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
