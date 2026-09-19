import type { Metadata } from 'next';
import { APP_CONFIG } from '@/constants/config';
import styles from './telegram.module.css';

export const metadata: Metadata = {
  title: 'Telegram',
  description: 'Únete al canal de Telegram de RogiPicks para recibir pronósticos y novedades.',
};

export default function TelegramPage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Telegram</h1>
        <p className={styles.subtitle}>
          Recibe los pronósticos al momento, alertas de partidos y el contacto directo con la
          comunidad RogiPicks.
        </p>
      </header>

      <section className={styles.card}>
        <p className={styles.cardText}>
          Entra al canal para no perderte ningún pick publicado y hablar con otros tipsters.
        </p>
        <a
          href={APP_CONFIG.telegramUrl}
          className={styles.cta}
          target="_blank"
          rel="noopener noreferrer"
        >
          Unirme a Telegram
        </a>
      </section>
    </div>
  );
}
