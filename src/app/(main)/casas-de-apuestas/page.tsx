import type { Metadata } from 'next';
import { BOOKMAKERS } from '@/lib/data/bookmakers';
import styles from './casas.module.css';

export const metadata: Metadata = {
  title: 'Casas de apuestas | RogiPicks',
  description: 'Compara casas de apuestas recomendadas para seguir los pronósticos de RogiPicks.',
};

export default function BookmakersPage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Casas de apuestas</h1>
        <p className={styles.subtitle}>
          Operadores recomendados para colocar tus pronósticos. Compara cuotas y juega siempre con
          responsabilidad.
        </p>
      </header>

      <div className={styles.list}>
        {BOOKMAKERS.map((house) => (
          <article key={house.name} className={styles.card}>
            {/* Columna 1: Foto de la casa de apuestas (marcador "Próximamente" con nombre) */}
            <div className={styles.logoBox}>
              <div className={styles.soonWrap}>
                <span className={styles.soonText}>Próximamente</span>
                <span className={styles.soonHouseName}>{house.name}</span>
              </div>
            </div>

            {/* Columna 2: Título y Descripción */}
            <div className={styles.info}>
              <h2 className={styles.cardTitle}>{house.name}</h2>
              <p className={styles.cardText}>{house.bonus}</p>
            </div>

            {/* Columna 3: Botón y aviso +18 al final de la línea */}
            <div className={styles.actionCol}>
              <a
                href={house.href}
                className={styles.cardLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visitar casa →
              </a>
              <span className={styles.disclaimer}>+18. Juega con responsabilidad.</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
