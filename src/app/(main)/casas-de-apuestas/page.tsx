import type { Metadata } from 'next';
import styles from './casas.module.css';

export const metadata: Metadata = {
  title: 'Casas de apuestas | RogiPicks',
  description: 'Compara casas de apuestas recomendadas para seguir los pronósticos de RogiPicks.',
};

const BOOKMAKERS = [
  {
    name: 'Bet365',
    logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Bet365_Logo.svg/1280px-Bet365_Logo.svg.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
    bonus: 'Líder mundial en apuestas deportivas con cuotas competitivas, retransmisión en directo (streaming) y una amplia variedad de mercados.',
    href: 'https://www.bet365.com',
  },
  {
    name: '1xBet',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/58fdd5da0000ff0005a117bb/0x0.png',
    bonus: 'Amplia variedad de mercados deportivos, cuotas competitivas y retransmisiones en directo. Popular en Europa del Este y mercados internacionales.',
    href: 'https://www.williamhill.com',
  },
  {
    name: 'DAZN Bet',
    logo: 'https://play-lh.googleusercontent.com/OI3ugKOdQI6WupjBy0SFC1YjvGisHso08vYUfJyhhEYEcUZd5YVaWDYn35Ngm93X54-ZAxn0Qcale_sy-Jv3',
    bonus: 'Plataforma reconocida en streaming de deportes, DAZN Bet complementa su oferta con una experiencia de apuestas dinámica, bonos de bienvenida para nuevos usuarios y una interfaz moderna para apostar en vivo.',
    href: 'https://www.betfair.com',
  },
  {
    name: 'Bwin',
    logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Bwin.svg/1280px-Bwin.svg.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
    bonus: 'Bwin destaca por su interfaz intuitiva y una sólida plataforma para apuestas en vivo. Ofrece promociones regulares y una amplia cobertura de eventos deportivos internacionales.',
    href: 'https://www.betfair.com',
  },
  {
    name: 'Betfair',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/46dd70ea0000640005012793/0x0.png',
    bonus: 'Betfair es reconocida mundialmente por su plataforma de apuestas cruzadas (Exchange), ofreciendo a los usuarios la posibilidad de apostar entre sí. Esto se traduce en cuotas muy competitivas y opciones avanzadas como el Cash Out.',
    href: 'https://www.betfair.com',
  },
  {
    name: 'William Hill',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/William_Hill_logo.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original',
    bonus: 'William Hill es una de las casas de apuestas más tradicionales del Reino Unido, con una reputación consolidada en el mercado global. Ofrece una amplia gama de mercados deportivos, cuotas competitivas y una plataforma robusta tanto para apuestas pre-partido como en vivo.',
    href: 'https://www.betfair.com',
  },
  {
    name: 'Codere',
    logo: 'https://assets.goal.com/images/v3/blt304293e65ea9e53c/codere-logo.jpg',
    bonus: 'Codere es una casa de apuestas con una fuerte presencia en España y Latinoamérica. Destaca por su amplia oferta de mercados deportivos y una plataforma de casino sólida. Ofrece promociones frecuentes y una experiencia de usuario adaptada a diferentes dispositivos móviles.',
    href: 'https://www.betfair.com',
  },
  {
    name: 'Sportium',
    logo: 'https://static.sportytrader.com/images/bookmakers/sp-spain/sportium/creative-pictures/review_sportium.webp',
    bonus: 'Sportium es una casa de apuestas con una fuerte presencia en España y Latinoamérica. Destaca por su amplia oferta de mercados deportivos y una plataforma de casino sólida. Ofrece promociones frecuentes y una experiencia de usuario adaptada a diferentes dispositivos móviles.',
    href: 'https://www.betfair.com',
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

      <div className={styles.list}>
        {BOOKMAKERS.map((house) => (
          <article key={house.name} className={styles.card}>
            {/* Columna 1: Imagen / Foto de la casa de apuestas a la izquierda */}
            <div className={styles.logoBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={house.logo}
                alt={`Logo ${house.name}`}
                className={styles.logoImg}
                width={140}
                height={68}
              />
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
