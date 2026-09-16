'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input/Input';
import { ROUTES } from '@/constants/routes';
import styles from './AuthForm.module.css';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    // Simular autenticación / login
    setTimeout(() => {
      setIsLoading(false);
      router.push(ROUTES.DASHBOARD);
    }, 800);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        <p className={styles.subtitle}>Accede a tu cuenta de RogiPicks</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p style={{ color: 'var(--color-danger-400)', fontSize: 'var(--text-xs)' }}>
            {error}
          </p>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Accediendo...' : 'Entrar a RogiPicks'}
        </button>
      </form>

      <div className={styles.footer}>
        ¿No tienes cuenta?
        <Link href={ROUTES.REGISTER} className={styles.link}>
          Regístrate gratis
        </Link>
      </div>
    </div>
  );
};
