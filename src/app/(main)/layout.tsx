import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';

export const metadata: Metadata = {
  title: 'Picks Deportivos',
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="page-wrapper">{children}</main>
      <Footer />
    </>
  );
}
