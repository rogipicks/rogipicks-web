import type { Metadata } from 'next';
import './globals.css';
import { TelegramFloat } from '@/components/features/telegram/TelegramFloat';
import { CookieConsent } from '@/components/features/cookies/CookieConsent';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

export const metadata: Metadata = {
  title: {
    default: 'RogiPicks — Picks Deportivos',
    template: '%s | RogiPicks',
  },
  description:
    'La plataforma de picks deportivos más completa. Analiza cuotas, sigue a los mejores tipsters y lleva el control de tus apuestas.',
  keywords: ['picks deportivos', 'apuestas', 'tipster', 'cuotas', 'fútbol', 'baloncesto'],
  authors: [{ name: 'RogiPicks' }],
  other: {
    'google-adsense-account': 'ca-pub-2281955679597214',
  },
  openGraph: {
    title: 'RogiPicks — Picks Deportivos',
    description: 'La plataforma de picks deportivos más completa.',
    type: 'website',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2281955679597214"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ScrollToTop />
        {children}
        <TelegramFloat />
        <CookieConsent />
      </body>
    </html>
  );
}