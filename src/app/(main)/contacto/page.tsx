import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/features/contact/ContactForm';
import { APP_CONFIG } from '@/constants/config';
import { COMPANY_LINKS, LEGAL_ENTITY } from '@/constants/company';
import { ROUTES } from '@/constants/routes';
import styles from './contacto.module.css';

export const metadata: Metadata = {
  title: 'Contacto | RogiPicks',
  description:
    '¿Tienes alguna duda sobre nuestros pronósticos, retos o casas de apuestas? Escríbenos con el formulario de contacto y te respondemos lo antes posible.',
};

export default function ContactPage() {
  const otherLinks = COMPANY_LINKS.filter((link) => link.href !== ROUTES.CONTACT);

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <span className={styles.badge}>Contacto</span>
        <h1 className={styles.title}>¿Tienes alguna duda? Escríbenos</h1>
        <p className={styles.lead}>
          Cuéntanos qué necesitas con el formulario y te responderemos al correo que nos dejes.
          También puedes escribirnos directamente por correo electrónico o por nuestro canal de
          Telegram: contestamos todos los mensajes reales.
        </p>
      </header>

      <div className={styles.grid}>
        <ContactForm />

        <aside className={styles.aside}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Canales directos</h2>
            <ul className={styles.channels}>
              <li>
                <a href={`mailto:${APP_CONFIG.contactEmail}`} className={styles.channel}>
                  <span className={styles.channelIcon} aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                  </span>
                  <span className={styles.channelText}>
                    <span className={styles.channelLabel}>Correo electrónico</span>
                    <span className={styles.channelValue}>{APP_CONFIG.contactEmail}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={APP_CONFIG.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.channel}
                >
                  <span className={styles.channelIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </span>
                  <span className={styles.channelText}>
                    <span className={styles.channelLabel}>Canal de Telegram</span>
                    <span className={styles.channelValue}>Avisos y picks al instante</span>
                  </span>
                </a>
              </li>
            </ul>
            <p className={styles.cardNote}>
              Plazo legal de respuesta: 30 días naturales. En dudas normales solemos contestar en
              menos de 48 horas.
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Qué hacemos con tus datos</h2>
            <p className={styles.cardText}>
              Usamos tu nombre, correo y mensaje solo para responderte. No los cedemos a terceros ni
              los usamos para publicidad. Responsable del tratamiento: {LEGAL_ENTITY.name} (
              {LEGAL_ENTITY.jurisdiction}).
            </p>
            <Link href={ROUTES.PRIVACY} className={styles.cardLink}>
              Leer la política de privacidad
            </Link>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Otros trámites</h2>
            <ul className={styles.linkList}>
              {otherLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.linkListItem}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}