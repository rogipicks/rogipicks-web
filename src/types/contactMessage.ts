// ─── Mensajes recibidos desde el formulario de contacto ──────────────────────

/** Asuntos disponibles en el formulario (el `value` es lo que viaja al servidor). */
export const CONTACT_TOPICS = [
  { value: 'duda-pronostico', label: 'Duda sobre un pronóstico' },
  { value: 'sugerencia', label: 'Sugerencia o mejora de la web' },
  { value: 'colaboracion', label: 'Colaboración, prensa o medios' },
  { value: 'casa-de-apuestas', label: 'Soy casa de apuestas o proveedor' },
  { value: 'proteccion-de-datos', label: 'Protección de datos (RGPD)' },
  { value: 'otro', label: 'Otro asunto' },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value'];

/** Todos los asuntos válidos, ya listos para validar en el servidor. */
export const CONTACT_TOPIC_VALUES: readonly string[] = CONTACT_TOPICS.map(
  (topic) => topic.value
);

/** Etiqueta legible de un asunto (para listados internos). */
export function contactTopicLabel(value: string): string {
  return CONTACT_TOPICS.find((topic) => topic.value === value)?.label ?? 'Otro asunto';
}

export const CONTACT_MESSAGE_STATUSES = ['nuevo', 'leido', 'respondido'] as const;

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  createdAt: string;
  status: ContactMessageStatus;
  /** Datos técnicos mínimos para poder filtrar spam o abusos. */
  meta?: {
    userAgent?: string;
    ip?: string;
  };
}

/** Límites compartidos entre el formulario y la API de contacto. */
export const CONTACT_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  MESSAGE_MIN: 15,
  MESSAGE_MAX: 1500,
} as const;