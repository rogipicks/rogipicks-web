'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
  { label: 'Explorar Picks', href: ROUTES.PICKS, icon: '🎯', badge: 'En Vivo' },
  { label: 'Clasificación', href: ROUTES.LEADERBOARD, icon: '🏆' },
  { label: 'Mi Perfil', href: ROUTES.PROFILE, icon: '👤' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNewPickClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  onNewPickClick,
}) => {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.topSection}>
        <div className={styles.userSummary}>
          <div className={styles.avatar}>RP</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Tipster Pro</span>
            <span className={styles.userRole}>Rango Diamante 💎</span>
          </div>
        </div>

        {onNewPickClick && (
          <button className={styles.newPickBtn} onClick={onNewPickClick}>
            <span>+</span> Publicar Pick
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        <span className={styles.sectionTitle}>Menú Principal</span>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  onClick={onClose}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footerStats}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>+24.5u</span>
          <span className={styles.statLabel}>Beneficio Mes</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>71%</span>
          <span className={styles.statLabel}>Win Rate</span>
        </div>
      </div>
    </aside>
  );
};
