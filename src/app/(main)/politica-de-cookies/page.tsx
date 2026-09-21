import type { Metadata } from 'next';
import { LegalPage } from '../_content/LegalPage';
import { cookiesContent } from '../_content/content';

export const metadata: Metadata = {
  title: 'Política de cookies | RogiPicks',
  description:
    'Qué cookies y almacenamiento local usa RogiPicks, para qué sirven, cuánto duran y cómo aceptarlas, rechazarlas o eliminarlas.',
};

export default function CookiesPolicyPage() {
  return <LegalPage content={cookiesContent} />;
}