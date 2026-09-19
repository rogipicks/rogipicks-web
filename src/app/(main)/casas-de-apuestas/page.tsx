import type { Metadata } from 'next';
import styles from './casas.module.css';

export const metadata: Metadata = {
  title: 'Casas de apuestas',
  description: 'Compara casas de apuestas recomendadas para seguir los pronósticos de RogiPicks.',
};

const BOOKMAKERS = [
  {
    name: 'Bet365',
    bonus: 'Cuotas competitivas y cobertura en vivo',
    href: 'https://www.bet365.com',
  },
  {
    name: 'Betfair',
    bonus: 'Exchange y cuotas altas en mercados populares',
    href: 'https://www.betfair.com',
  },
  {
    name: 'William Hill',
    bonus: 'Amplia oferta en fútbol y competiciones europeas',
    href: 'https://www.williamhill.com',
  },
  {
    name: 'Unibet',
    bonus: 'Combinadas y mercados especiales',
    href: 'https://www.unibet.com',
  },
];

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

      <div className={styles.grid}>
        {BOOKMAKERS.map((house) => (
          <article key={house.name} className={styles.card}>
            <h2 className={styles.cardTitle}>{house.name}</h2>
            <p className={styles.cardText}>{house.bonus}</p>
            <a
              href={house.href}
              className={styles.cardLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visitar casa
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
