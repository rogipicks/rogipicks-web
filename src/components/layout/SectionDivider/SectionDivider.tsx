import styles from './SectionDivider.module.css';

/**
 * Separador simple entre secciones: una única línea fina a todo el ancho de la
 * ventana (de borde a borde), para marcar el corte sin añadir peso visual.
 */
export function SectionDivider() {
  return (
    <div className={styles.divider} role="presentation" aria-hidden="true">
      <span className={styles.line} />
    </div>
  );
}