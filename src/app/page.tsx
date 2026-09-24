import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';
import { getAllPicks } from '@/lib/db/picksDb';
import { getAllRetos } from '@/lib/db/retosDb';
import { BOOKMAKERS } from '@/lib/data/bookmakers';
import { WinnersCarousel } from '@/components/features/picks/WinnersCarousel';
import { BestOfDayPodium } from '@/components/features/picks/BestOfDayPodium';
import { PickCard } from '@/components/features/picks/PickCard';
import { LatestRetos } from '@/components/features/retos/LatestRetos';
import { SectionDivider } from '@/components/layout/SectionDivider/SectionDivider';
import type { Pick } from '@/types/pick';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

/** Icono de trazo reutilizable (mismo lenguaje visual que la Navbar). */
function Icon({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * Métricas reales de la web, calculadas sobre los picks públicos:
 * total, porcentaje de acierto, cuota media y mejor racha de aciertos.
 */
function computeHomeStats(picks: Pick[]) {
  const publicPicks = picks.filter((p) => p.isPublic);
  const settled = publicPicks.filter((p) => p.result === 'win' || p.result === 'loss');
  const wins = settled.filter((p) => p.result === 'win').length;

  const odds = publicPicks
    .map((p) => Number(p.odds))
    .filter((o) => Number.isFinite(o) && o > 1);

  const chrono = [...publicPicks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  let bestStreak = 0;
  let run = 0;
  for (const p of chrono) {
    if (p.result === 'win') {
      run += 1;
      if (run > bestStreak) bestStreak = run;
    } else if (p.result === 'loss') {
      run = 0;
    }
  }

  return {
    total: publicPicks.length,
    winRate: settled.length > 0 ? Math.round((wins / settled.length) * 100) : 0,
    avgOdds: odds.length > 0 ? odds.reduce((a, b) => a + b, 0) / odds.length : 0,
    bestStreak,
  };
}

const WHY_ITEMS: { icon: ReactNode; title: string; text: string }[] = [
  {
    title: 'Análisis, no corazonadas',
    text: 'Cada pronóstico se publica con su cuota, la probabilidad estimada y el razonamiento detrás. Nada de picks sin argumentos.',
    icon: (
      <Icon>
        <path d="M3 3v18h18" />
        <path d="m7 15 3-4 3 3 5-7" />
      </Icon>
    ),
  },
  {
    title: 'Gestión de bankroll',
    text: 'Proponemos el stake de cada apuesta para que cuidar el dinero importe tanto como acertar el pronóstico.',
    icon: (
      <Icon>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </Icon>
    ),
  },
  {
    title: 'Telegram gratuito',
    text: 'Los avisos llegan al instante al canal: sin coste, sin spam y con la comunidad respondiendo dudas todos los días.',
    icon: (
      <Icon>
        <path d="M22 2 11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </Icon>
    ),
  },
  {
    title: 'Historial transparente',
    text: 'Publicamos aciertos y fallos con su cuota registrada. Puedes revisar cada resultado en la sección de pronósticos.',
    icon: (
      <Icon>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </Icon>
    ),
  },
];

const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: '¿RogiPicks es gratis?',
    a: (
      <>
        Sí. El canal de Telegram es totalmente gratuito: recibes los pronósticos, las
        actualizaciones de los retos y los avisos de última hora sin pagar nada. Puedes entrar
        cuando quieras desde el botón del canal.
      </>
    ),
  },
  {
    q: '¿Con qué frecuencia publicáis picks?',
    a: (
      <>
        Publicamos análisis de forma continua y destacamos los tres mejores de la jornada en el
        podio del día. Los últimos pronósticos aparecen siempre en la portada y el historial
        completo está en <Link href={ROUTES.PICKS}>Apuestas deportivas</Link>.
      </>
    ),
  },
  {
    q: '¿Qué es el podio del día?',
    a: (
      <>
        Es nuestra selección de los tres pronósticos más sólidos de la jornada, ordenados del 1º
        al 3º. Sirven como referencia de las apuestas con mejor relación entre cuota y
        probabilidad.
      </>
    ),
  },
  {
    q: '¿Puedo ver los resultados anteriores?',
    a: (
      <>
        Sí. Cada pick público muestra su estado (ganado, perdido o pendiente) y la cuota con la
        que se registró, para que puedas evaluar el historial con total transparencia.
      </>
    ),
  },
  {
    q: '¿Qué son los retos?',
    a: (
      <>
        Retos con gestión estricta de bankroll que seguimos paso a paso, desde la cantidad inicial
        hasta el objetivo. Puedes seguirlos en directo desde la sección{' '}
        <Link href={ROUTES.RETOS}>Retos</Link>.
      </>
    ),
  },
];

export default async function HomePage() {
  const allPicks = await getAllPicks();
  // Últimos picks ganados y públicos: los 10 más recientes (los viejos se descartan)
  const winners = allPicks
    .filter((p) => p.result === 'win' && p.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Últimos picks subidos: los 3 más recientes públicos
  const latestPicks = allPicks
    .filter((p) => p.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const allRetos = await getAllRetos();

  const homeStats = computeHomeStats(allPicks);
  const statCards = [
    {
      label: 'Picks publicados',
      value: String(homeStats.total),
      icon: (
        <Icon>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </Icon>
      ),
    },
    {
      label: 'Acierto',
      value: `${homeStats.winRate}%`,
      icon: (
        <Icon>
          <path d="m3 17 6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </Icon>
      ),
    },
    {
      label: 'Cuota media',
      value: homeStats.avgOdds > 0 ? `${homeStats.avgOdds.toFixed(2)}x` : '—',
      icon: (
        <Icon>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </Icon>
      ),
    },
    {
      label: 'Mejor racha',
      value: String(homeStats.bestStreak),
      icon: (
        <Icon>
          <path d="M12 2s4 4.5 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 8 10.5 8 12a4 4 0 0 0 8 0c0-4-4-10-4-10z" />
          <path d="M12 22a6 6 0 0 0 6-6c0-2-1-3.5-2-4.5" />
        </Icon>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroLive}>
              <span className={styles.heroDot} aria-hidden="true" />
              <span> La web definitiva para apostadores</span>
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
                <span>Canal de Telegram</span>
              </a>
              <Link href={ROUTES.PICKS} className={styles.btnSecondary}>
                <span>Apuestas deportivas</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className={styles.heroChips}>
              <span className={`${styles.heroChip} ${styles.heroChipFree}`}>✓ Gratis</span>
              <span className={styles.heroChip}>Sin spam</span>
              <span className={styles.heroChip}>Avisos en directo</span>
              <span className={styles.heroChip}>Comunidad activa</span>
            </div>
          </div>

          <a
            href="#estadisticas"
            className={styles.heroScroll}
            aria-label="Ver el historial verificado"
          >
            <Icon size={20}>
              <path d="M12 5v14" />
              <path d="m6 13 6 6 6-6" />
            </Icon>
          </a>

          {/* Carrusel de últimos picks ganados (franja inferior del hero) */}
          <WinnersCarousel picks={winners} />
        </section>

        {/* Franja de estadísticas: datos reales del historial público */}
        <section id="estadisticas" className={styles.stats} aria-label="Historial verificado">
          <div className={`container ${styles.statsInner}`}>
            <div className={styles.statsGrid}>
              {statCards.map((card) => (
                <article key={card.label} className={styles.stat}>
                  <span className={styles.statIcon} aria-hidden="true">
                    {card.icon}
                  </span>
                  <span className={styles.statBody}>
                    <span className={styles.statValue}>{card.value}</span>
                    <span className={styles.statLabel}>{card.label}</span>
                  </span>
                </article>
              ))}
            </div>
            <p className={styles.statsNote}>
              Métricas calculadas en directo sobre nuestros pronósticos públicos. Las apuestas
              conllevan riesgo: apuesta solo lo que puedas permitirte perder. +18.
            </p>
          </div>
        </section>

        {/* Podio: picks marcados como 1º, 2º o 3º en admin, organizados por día */}
        <BestOfDayPodium initialPicks={allPicks} />

        {/* Franja separadora entre el podio y los últimos picks */}
        <SectionDivider />

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

        {/* Por qué RogiPicks: propuesta de valor */}
        <section className={styles.why} aria-label="Por qué elegir RogiPicks">
          <div className={`container ${styles.whyInner}`}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionKicker}>Por qué RogiPicks</span>
              <h2 className={styles.sectionTitle}>
                Pronósticos con método, <span className={styles.sectionAccent}>no con suerte</span>
              </h2>
              <p className={styles.sectionSub}>
                Combinamos análisis de cuotas, gestión de bankroll y seguimiento público para que
                cada apuesta tenga sentido más allá del resultado puntual.
              </p>
            </div>

            <div className={styles.whyGrid}>
              {WHY_ITEMS.map((item) => (
                <article key={item.title} className={styles.whyCard}>
                  <span className={styles.whyIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3 className={styles.whyTitle}>{item.title}</h3>
                  <p className={styles.whyText}>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Casas de apuestas recomendadas */}
        <section className={styles.houses} aria-label="Casas de apuestas recomendadas">
          <div className={`container ${styles.housesInner}`}>
            <div className={styles.housesHead}>
              <div>
                <h2 className={styles.housesTitle}>
                  Casas donde colocar <span className={styles.sectionAccent}>los picks</span>
                </h2>
                <p className={styles.sectionSub}>
                  Comparamos los operadores que usamos para registrar cuotas y buscar los mejores
                  mercados.
                </p>
              </div>
              <Link href={ROUTES.BOOKMAKERS} className={styles.latestLink}>
                Ver todas
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className={styles.housesGrid}>
              {BOOKMAKERS.slice(0, 6).map((house) => (
                <a
                  key={house.name}
                  href={house.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={styles.houseChip}
                  title={house.name}
                >
                  {/* Marcador "Próximamente" con nombre de la casa de apuestas */}
                  <span className={styles.houseSoon}>Próximamente</span>
                  <span className={styles.houseName}>{house.name}</span>
                </a>
              ))}
            </div>

            <p className={styles.housesNote}>
              +18. Juega con responsabilidad. Los bonos y condiciones los define cada operador y
              pueden cambiar sin aviso.
            </p>
          </div>
        </section>

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

        {/* Franja separadora entre los últimos retos y el canal de Telegram */}
        <SectionDivider />

        {/* CTA: canal de Telegram gratuito */}
        <section className={styles.cta} aria-label="Únete al canal de Telegram">
          <div className={`container ${styles.ctaInner}`}>
            <div className={styles.ctaBox}>
              <Image
                src="/images/logo.png"
                alt=""
                width={130}
                height={90}
                className={styles.ctaIcon}
                aria-hidden="true"
              />

              <h2 className={styles.ctaTitle}>Únete gratis al canal de Telegram</h2>
              <p className={styles.ctaText}>
                Recibe cada pronóstico en el momento en que se publica, con su cuota y su análisis.
                La comunidad responde tus dudas todos los días.
              </p>

              <div className={styles.ctaChips}>
                <span className={`${styles.chip} ${styles.chipFree}`}>✓ Gratis</span>
                <span className={styles.chip}>Sin spam</span>
                <span className={styles.chip}>Avisos en directo</span>
              </div>

              <a
                href={APP_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaButton}
              >
                Unirme al canal
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>

              <p className={styles.ctaNote}>
                +18. Juega con responsabilidad. Las apuestas conllevan riesgo.
              </p>
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section className={styles.faq} aria-label="Preguntas frecuentes">
          <div className={`container ${styles.faqInner}`}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionKicker}>Dudas frecuentes</span>
              <h2 className={styles.sectionTitle}>
                Todo lo que <span className={styles.sectionAccent}>necesitas saber</span>
              </h2>
            </div>

            <div className={styles.faqList}>
              {FAQ_ITEMS.map((item) => (
                <details key={item.q} className={styles.faqItem}>
                  <summary className={styles.faqQ}>
                    <span>{item.q}</span>
                    <span className={styles.faqMark} aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className={styles.faqA}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
