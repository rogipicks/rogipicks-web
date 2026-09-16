import type { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | RogiPicks',
  description: 'Inicia sesión en tu cuenta de RogiPicks.',
};

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      <LoginForm />
    </div>
  );
}
