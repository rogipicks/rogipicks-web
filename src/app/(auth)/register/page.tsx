import type { Metadata } from 'next';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Crear Cuenta | RogiPicks',
  description: 'Regístrate en RogiPicks y únete a la comunidad de apuestas deportivas.',
};

export default function RegisterPage() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      <RegisterForm />
    </div>
  );
}
