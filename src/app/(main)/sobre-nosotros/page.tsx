import type { Metadata } from 'next';
import { LegalPage } from '../_content/LegalPage';
import { aboutContent } from '../_content/content';

export const metadata: Metadata = {
  title: 'Sobre nosotros | RogiPicks',
  description:
    'Quiénes somos, cómo analizamos los partidos y con qué principios publicamos nuestros pronósticos deportivos.',
};

export default function AboutPage() {
  return <LegalPage content={aboutContent} />;
}