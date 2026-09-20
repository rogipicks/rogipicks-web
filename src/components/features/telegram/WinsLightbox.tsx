'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './WinsLightbox.module.css';

interface WinsLightboxProps {
  /** Rutas públicas de todas las capturas del carrusel. */
  images: string[];
  /** Índice de la captura que se está viendo ampliada. */
  index: number;
  /** Cambia de captura (lo usan las flechas, el teclado y el swipe). */
  onIndexChange: (next: number) => void;
  /** Cierra el visor. */
  onClose: () => void;
  /** Descripción accesible de la galería. */
  label?: string;
  /** Botón que abrió el visor: recupera el foco al cerrar. */
  returnFocusTo?: HTMLElement | null;
}

/** Distancia mínima (px) para considerar un deslizamiento táctil. */
const SWIPE_THRESHOLD = 45;

/**
 * Visor ampliado de una captura de pronóstico ganado.
 *
 * Se abre al pulsar cualquier captura del carrusel y permite recorrerlas todas
 * con las flechas laterales, el teclado (← →, Inicio y Fin), el swipe en móvil o
 * un clic fuera de la imagen. `Esc` cierra y devuelve el foco a la captura.
 */
export const WinsLightbox: React.FC<WinsLightboxProps> = ({
  images,
  index,
  onIndexChange,
  onClose,
  label = 'Pronósticos ganados en RogiPicks',
  returnFocusTo,
}) => {
  const total = images.length;
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Al abrir bloqueamos el scroll de la página y llevamos el foco al cierre;
  // al cerrar devolvemos el foco a la captura desde la que se abrió.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusTo?.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);

  const goPrev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const goNext = useCallback(() => {
    if (index < total - 1) onIndexChange(index + 1);
  }, [index, onIndexChange, total]);

  // Teclado mientras el visor está abierto.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      } else if (event.key === 'Home') {
        event.preventDefault();
        onIndexChange(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        onIndexChange(total - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose, onIndexChange, total]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;

    const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX > 0) goPrev();
    else goNext();
  };

  const currentSrc = images[index] ?? images[0];

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`${label} — vista ampliada`}
      onClick={(event) => {
        // Solo cierra si el clic cae fuera de la captura (en el fondo oscuro).
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeRef}
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Cerrar vista ampliada"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <span className={styles.counter} aria-live="polite">
        {index + 1} / {total}
      </span>

      <div className={styles.stage}>
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={`${label} — captura ${index + 1} de ${total}`}
          fill
          sizes="(max-width: 720px) 100vw, 520px"
          className={styles.image}
          draggable={false}
          priority
        />
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Captura anterior"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={goNext}
            disabled={index === total - 1}
            aria-label="Captura siguiente"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};