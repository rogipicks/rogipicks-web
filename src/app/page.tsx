import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroLabel}>
              <span>🎯 La plataforma de tipsters</span>
            </div>
            <h1 className={styles.heroTitle}>
              Tus picks, <br />
              <span className={styles.heroHighlight}>al siguiente nivel</span>
            </h1>
            <p className={styles.heroDesc}>
              Analiza cuotas, publica tus picks, sigue a los mejores tipsters y lleva el
              control total de tus apuestas deportivas.
            </p>
            <div className={styles.heroActions}>
              <a href="/register" className={styles.btnPrimary}>Empezar gratis</a>
              <a href="/picks" className={styles.btnSecondary}>Ver picks →</a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={`container ${styles.stats}`}>
          {[
            { value: '10K+', label: 'Picks publicados' },
            { value: '2.3K', label: 'Tipsters activos' },
            { value: '68%', label: 'Win rate medio' },
            { value: '+21%', label: 'ROI promedio' },
          ].map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
