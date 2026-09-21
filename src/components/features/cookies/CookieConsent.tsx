'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './CookieConsent.module.css';

const STORAGE_KEY = 'rogipicks-cookie-consent';
const MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 meses

export interface CookiePreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
}

function loadPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePreferences;
    if (!parsed?.savedAt) return null;
    if (Date.now() - new Date(parsed.savedAt).getTime() > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Banner de consentimiento de cookies (LSSI-CE art. 22.2).
 * Se muestra hasta que el visitante acepta, rechaza o configura.
 * La elección se guarda en localStorage durante ~6 meses.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!loadPreferences()) setVisible(true);
  }, []);

  const save = (prefs: Omit<CookiePreferences, 'necessary' | 'savedAt'>) => {
    const value: CookiePreferences = {
      necessary: true,
      ...prefs,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* almacenamiento no disponible: no bloqueamos la navegación */
    }
    setVisible(false);
    setShowConfig(false);
  };

  if (!visible) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-label="Aviso de cookies"
    >
      <div className={styles.banner}>
        <div className={styles.content}>
          <p className={styles.title}>🍪 Tu privacidad importa</p>
          <p className={styles.text}>
            Usamos cookies necesarias para que el sitio funcione y, sólo si las
            aceptas, cookies analíticas para mejorar. Puedes{' '}
            <Link href="/politica-de-cookies" className={styles.link}>
              leer la política de cookies
            </Link>{' '}
            o cambiar tu elección cuando quieras.
          </p>

          {showConfig && (
            <div className={styles.config}>
              <label className={styles.option}>
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Necesarias</strong> — imprescindibles para navegar.
                  Siempre activas.
                </span>
              </label>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span>
                  <strong>Analíticas</strong> — estadísticas anónimas de uso
                  para mejorar la web.
                </span>
              </label>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span>
                  <strong>Marketing</strong> — personalización de contenido y
                  promociones.
                </span>
              </label>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {showConfig ? (
            <>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setShowConfig(false)}
              >
                Volver
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => save({ analytics, marketing })}
              >
                Guardar preferencias
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => save({ analytics: false, marketing: false })}
              >
                Rechazar
              </button>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setShowConfig(true)}
              >
                Configurar
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => save({ analytics: true, marketing: true })}
              >
                Aceptar todas
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}