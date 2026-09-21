import type { Metadata } from 'next';
import { LegalPage } from '../_content/LegalPage';
import { privacyContent } from '../_content/content';

export const metadata: Metadata = {
  title: 'Política de Privacidad | RogiPicks',
  description:
    'Información sobre el tratamiento de datos personales en RogiPicks conforme al RGPD y a la LOPDGDD: finalidades, derechos y conservación.',
};

export default function PrivacyPolicyPage() {
  return <LegalPage content={privacyContent} />;
}