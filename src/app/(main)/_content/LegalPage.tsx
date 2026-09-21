import Link from 'next/link';
import { COMPANY_LINKS, LEGAL_ENTITY } from '@/constants/company';
import { APP_CONFIG } from '@/constants/config';
import styles from './legalPage.module.css';

/** Bloque de contenido: un párrafo o una lista de puntos. */
export type LegalBlock =
  | { kind: 'text'; title?: string; body: string }
  | { kind: 'list'; title?: string; items: string[] };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalPageContent {
  badge: string;
  title: string;
  lead: string;
  updatedAt: string;
  highlights?: { value: string; label: string }[];
  sections: LegalSection[];
}

/**
 * Plantilla compartida por las páginas de compañía y de información legal
 * (Sobre nosotros, Contactos, Acuerdo de usuario, Privacidad y Cookies).
 * Sólo recibe el contenido; el diseño vive aquí para que todas se vean igual.
 */
export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <span className={styles.badge}>{content.badge}</span>
        <h1 className={styles.title}>{content.title}</h1>
        <p className={styles.lead}>{content.lead}</p>
        <p className={styles.updated}>
          Última actualización: {content.updatedAt} · Responsable: {LEGAL_ENTITY.name} (
          {LEGAL_ENTITY.jurisdiction})
        </p>
      </header>

      {content.highlights && (
        <ul className={styles.highlights}>
          {content.highlights.map((item) => (
            <li key={item.label} className={styles.highlight}>
              <span className={styles.highlightValue}>{item.value}</span>
              <span className={styles.highlightLabel}>{item.label}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.sections}>
        {content.sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <div className={styles.blocks}>
              {section.blocks.map((block, index) => (
                <div key={`${section.title}-${index}`}>
                  {block.title && <h3 className={styles.blockTitle}>{block.title}</h3>}
                  {block.kind === 'text' ? (
                    <p className={styles.text}>{block.body}</p>
                  ) : (
                    <ul className={styles.list}>
                      {block.items.map((item) => (
                        <li key={item} className={styles.listItem}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className={styles.footNote}>
        ¿Dudas sobre este documento? Escríbenos a{' '}
        <a href={`mailto:${APP_CONFIG.contactEmail}`}>{APP_CONFIG.contactEmail}</a> y te responderemos lo
        antes posible. También puedes unirte a nuestro{' '}
        <a href={APP_CONFIG.telegramUrl} target="_blank" rel="noopener noreferrer">
          canal de Telegram
        </a>
        .
      </p>

      <ul className={styles.related} aria-label="Otras páginas legales">
        {COMPANY_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={styles.relatedLink}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}