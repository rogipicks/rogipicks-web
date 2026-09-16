import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'RogiPicks — Picks Deportivos',
    template: '%s | RogiPicks',
  },
  description:
    'La plataforma de picks deportivos más completa. Analiza cuotas, sigue a los mejores tipsters y lleva el control de tus apuestas.',
  keywords: ['picks deportivos', 'apuestas', 'tipster', 'cuotas', 'fútbol', 'baloncesto'],
  authors: [{ name: 'RogiPicks' }],
  openGraph: {
    title: 'RogiPicks — Picks Deportivos',
    description: 'La plataforma de picks deportivos más completa.',
    type: 'website',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
