import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';
import { getAllPicks } from '@/lib/db/picksDb';
import { getAllRetos } from '@/lib/db/retosDb';
import { WinnersCarousel } from '@/components/features/picks/WinnersCarousel';
import { BestOfDayPodium } from '@/components/features/picks/BestOfDayPodium';
import { PickCard } from '@/components/features/picks/PickCard';
import { LatestRetos } from '@/components/features/retos/LatestRetos';
import type { Pick } from '@/types/pick';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const allPicks = await getAllPicks();
  // Últimos picks ganados y públicos: los 10 más recientes (los viejos se descartan)
  const winners = allPicks
    .filter((p) => p.result === 'win' && p.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Podio: picks marcados como 1º/2º/3º en admin (públicos); gana el más reciente
  const podiumOfDay = ([1, 2, 3] as const).map((pos) =>
    allPicks
      .filter((p) => p.podium === pos && p.isPublic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
  );

  // Últimos picks subidos: los 5 más recientes públicos
  const latestPicks = allPicks
    .filter((p) => p.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

  const allRetos = await getAllRetos();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroLabel}>
              <span>⚽ La web definitiva para apostadores</span>
            </div>
            <h1 className={styles.heroTitle}>
              Datos que <br />
              <span className={styles.heroHighlight}>ganan partidos</span>
            </h1>
            <p className={styles.heroDesc}>
              Una comunidad creada para quienes buscan análisis deportivos de calidad. Descubre nuestras previsiones y el desglose táctico de los eventos más destacados del calendario deportivo.
            </p>
            <div className={styles.heroActions}>
              <a
                href="https://t.me/+yRs5E_z6tt81NWE0"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                <span>Canal VIP Telegram</span>
              </a>
              <Link href={ROUTES.PICKS} className={styles.btnSecondary}>
                <span>Apuestas deportivas</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Carrusel de últimos picks ganados (franja inferior del hero) */}
          <WinnersCarousel picks={winners} />
        </section>

        {/* Podio: picks marcados como 1º, 2º o 3º en admin (siempre visible) */}
        <BestOfDayPodium positions={podiumOfDay} />

        {/* Últimos picks subidos (los 5 más recientes) */}
        {latestPicks.length > 0 && (
          <section className={styles.latest} aria-label="Últimos picks subidos">
            <div className={`container ${styles.latestInner}`}>
              <div className={styles.latestHeader}>
                <h2 className={styles.latestTitle}>
                  Últimos <span className={styles.latestAccent}>picks</span>
                </h2>
                <Link href={ROUTES.PICKS} className={styles.latestLink}>
                  Ver todos
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className={styles.latestGrid}>
                {latestPicks.map((pick) => (
                  <PickCard key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          </section>
                )}

        {/* Últimos retos subidos (3 más recientes) */}
        <section className={styles.retos} aria-label="Últimos retos subidos">
          <div className={`container ${styles.retosInner}`}>
            <div className={styles.latestHeader}>
              <h2 className={styles.latestTitle}>
                Últimos <span className={styles.latestAccent}>retos</span>
              </h2>
              <Link href={ROUTES.RETOS} className={styles.latestLink}>
                Ver todos
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
            <LatestRetos retos={allRetos} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
