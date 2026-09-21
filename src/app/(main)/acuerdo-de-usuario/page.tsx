import type { Metadata } from 'next';
import { LegalPage } from '../_content/LegalPage';
import { agreementContent } from '../_content/content';

export const metadata: Metadata = {
  title: 'Acuerdo de usuario | RogiPicks',
  description:
    'Condiciones de uso de RogiPicks: requisitos de acceso, uso permitido, responsabilidad, juego responsable y normativa aplicable.',
};

export default function UserAgreementPage() {
  return <LegalPage content={agreementContent} />;
}