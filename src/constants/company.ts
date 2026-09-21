// ─── Enlaces de compañía / información legal ──────────────────────────────────
// Se usan en el footer y en las propias páginas legales para enlazarse entre sí.

import { ROUTES } from './routes';

export const COMPANY_LINKS = [
  { label: 'Sobre nosotros', href: ROUTES.ABOUT },
  { label: 'Contactos', href: ROUTES.CONTACT },
  { label: 'Acuerdo de usuario', href: ROUTES.USER_AGREEMENT },
  { label: 'Política de Privacidad', href: ROUTES.PRIVACY },
  { label: 'Política de cookies', href: ROUTES.COOKIES },
] as const;

/** Última revisión de los textos legales (se muestra en cada página). */
export const LEGAL_UPDATED_AT = '21 de septiembre de 2026';

/** Identificación del responsable (exigida por la LSSI-CE para sitios web). */
export const LEGAL_ENTITY = {
  name: 'RogiPicks',
  email: 'rogipicks@gmail.com',
  jurisdiction: 'España',
} as const;