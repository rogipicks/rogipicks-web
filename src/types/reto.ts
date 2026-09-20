export type RetoBadgeType = 'active' | 'new' | 'special';

/** Estado de un paso del reto. */
export type RetoStepResult = 'win' | 'loss' | 'pending';

/**
 * Un paso del reto. Se crea tantas veces como se indique en
 * "Número de pasos del reto" y se muestra igual que un pick:
 * logo del equipo local, logo del visitante, nombres y descripción,
 * con su estado (ganado / perdido / pendiente) y el dinero
 * (con el que empieza el paso y con el que acaba tras la apuesta).
 */
export type RetoStep = {
  id: string;
  homeTeam: string;
  homeLogo?: string; // URL o data URL (base64)
  awayTeam: string;
  awayLogo?: string; // URL o data URL (base64)
  desc: string;      // descripción / análisis del paso
  result?: RetoStepResult; // estado del paso
  startAmount?: string;    // dinero inicial del paso
  endAmount?: string;      // dinero con el que acabamos el paso
  startTime?: string;      // fecha y hora del partido (ISO)
  bet?: string;            // nombre de la apuesta
  odds?: string;           // cuota
};

export type Reto = {
  id: string;
  title: string;
  badge: string;
  badgeType: RetoBadgeType;
  desc: string;
  currentStep: string;
  progress: number;
  stake: string;
  currentBank: string;
  category: string;
  telegramUrl?: string;
  /**
   * Interruptor "Telegram?" del panel de admin.
   * - true  → en /retos el botón de la tarjeta es "Sigue el reto en Telegram"
   *           y lleva al canal (no se abre el modal del paso).
   * - false / undefined → comportamiento normal: botón "Saber Más del Reto"
   *           y modal con el paso actual.
   */
  telegramMode?: boolean;
  coverImage?: string;        // foto de portada del reto (URL o data URL)
  totalSteps?: number;        // número de pasos configurado por el admin
  startingAmount?: string;    // dinero con el que empieza el reto
  objective?: string;         // objetivo del reto
  steps?: RetoStep[];         // pasos del reto (picks que componen el reto)
  createdAt?: string;
  updatedAt?: string;
};
