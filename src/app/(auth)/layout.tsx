import { Navbar } from '@/components/layout/Navbar/Navbar';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="page-wrapper">{children}</main>
    </>
  );
}
