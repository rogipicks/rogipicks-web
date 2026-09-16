'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input/Input';
import { ROUTES } from '@/constants/routes';
import styles from './AuthForm.module.css';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'better' | 'tipster'>('tipster');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push(ROUTES.DASHBOARD);
    }, 800);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Crear Cuenta</h1>
        <p className={styles.subtitle}>Únete a la comunidad líder de apuestas deportivas</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Nombre de usuario"
          placeholder="Ej: MagoDelBalon"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="Al menos 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Quiero usar RogiPicks como:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setRole('tipster')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: role === 'tipster' ? 'var(--color-brand-400)' : 'var(--color-border)',
                backgroundColor: role === 'tipster' ? 'hsl(230 60% 45% / 0.2)' : 'var(--color-bg-base)',
                color: role === 'tipster' ? 'var(--color-brand-300)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              🎯 Tipster / Pronosticador
            </button>
            <button
              type="button"
              onClick={() => setRole('better')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: role === 'better' ? 'var(--color-brand-400)' : 'var(--color-border)',
                backgroundColor: role === 'better' ? 'hsl(230 60% 45% / 0.2)' : 'var(--color-bg-base)',
                color: role === 'better' ? 'var(--color-brand-300)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              📈 Apostador / Seguidor
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--color-danger-400)', fontSize: 'var(--text-xs)' }}>
            {error}
          </p>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Crear Cuenta Gratis'}
        </button>
      </form>

      <div className={styles.footer}>
        ¿Ya tienes cuenta?
        <Link href={ROUTES.LOGIN} className={styles.link}>
          Inicia sesión
        </Link>
      </div>
    </div>
  );
};
