'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { WinsLightbox } from './WinsLightbox';
import styles from './WinsCarousel.module.css';

interface WinsCarouselProps {
  /** Rutas públicas de las capturas (p. ej. `/images/ganados/ganado-1.png`). */
  images: string[];
  /** Descripción accesible del carrusel. */
  label?: string;
}

/** Fracción mínima de la barra de progreso para que el carril siempre se vea. */
const MIN_THUMB_RATIO = 0.12;

/** Distancia mínima (px) para considerar que el ratón está arrastrando. */
const DRAG_THRESHOLD = 5;

/** Respeta la preferencia de movimiento reducido del sistema. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Carrusel en fila de capturas de pronósticos ganados.
 *
 * Se ven todas las capturas que caben a lo ancho y el resto se desliza con las
 * flechas laterales (que solo aparecen si hay algo que deslizar), arrastrando con
 * el ratón, deslizando el dedo en el móvil, con la rueda horizontal del trackpad o
 * con el teclado (← →, Inicio y Fin) cuando el carrusel tiene el foco.
 */
export const WinsCarousel: React.FC<WinsCarouselProps> = ({
  images,
  label = 'Pronósticos ganados en RogiPicks',
}) => {
  const total = images.length;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);

  const [dragging, setDragging] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleRatio, setVisibleRatio] = useState(1);

  /** Captura abierta en el visor ampliado; `null` cuando está cerrado. */
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /** Botón de la captura que abrió el visor, para devolverle el foco al cerrar. */
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  /** Evita abrir el visor cuando el «clic» es en realidad el final de un arrastre. */
  const suppressClickRef = useRef(false);
  const suppressTimerRef = useRef<number | null>(null);

  /** Mide el carril: cuánto desborda, dónde está y qué tramo se ve. */
  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const max = Math.max(el.scrollWidth - el.clientWidth, 0);
    const hasOverflow = max > 2;

    setOverflowing(hasOverflow);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(!hasOverflow || el.scrollLeft >= max - 2);
    setProgress(max > 0 ? Math.min(el.scrollLeft / max, 1) : 0);
    setVisibleRatio(el.scrollWidth > 0 ? Math.min(el.clientWidth / el.scrollWidth, 1) : 1);
  }, []);

  // Medimos al montar, cuando cambia el número de capturas y cuando cambia el ancho.
  useEffect(() => {
    measure();

    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, total]);

  // Si cambia el listado de capturas, cerramos el visor para no quedar fuera de rango.
  useEffect(() => {
    setLightboxIndex(null);
  }, [total]);

  // Al cambiar de captura en el visor, acompañamos el carril para dejarla a la vista.
  useEffect(() => {
    if (lightboxIndex === null) return;

    const slide = scrollerRef.current?.children[lightboxIndex] as HTMLElement | undefined;
    slide?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }, [lightboxIndex]);

  /** Abre el visor ampliado en la captura indicada. */
  const openLightbox = useCallback((i: number, trigger: HTMLButtonElement | null) => {
    // Tras arrastrar, el navegador emite un clic que no debe abrir nada.
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    lastTriggerRef.current = trigger;
    setLightboxIndex(i);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  // El scroll se agrupa por frame para no recalcular en cada píxel.
  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      measure();
    });
  }, [measure]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (suppressTimerRef.current !== null) window.clearTimeout(suppressTimerRef.current);
    },
    []
  );

  /** Ancho de una captura más el hueco: el paso de un deslizamiento. */
  const getPitch = useCallback(() => {
    const el = scrollerRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;

    const { columnGap, gap } = window.getComputedStyle(el);
    const gapSize = parseFloat(columnGap || gap || '0') || 0;
    return first.getBoundingClientRect().width + gapSize;
  }, []);

  /** Lleva el carril a una posición concreta. */
  const alignTo = useCallback((left: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, []);

  /** Desliza una captura hacia la izquierda (-1) o hacia la derecha (1). */
  const slideByOne = useCallback(
    (direction: -1 | 1) => {
      const el = scrollerRef.current;
      const pitch = getPitch();
      if (!el || pitch <= 0) return;

      el.scrollBy({
        left: direction * pitch,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [getPitch]
  );

  /** Tras arrastrar con el ratón, encaja la captura más cercana al borde. */
  const snapToNearest = useCallback(() => {
    const el = scrollerRef.current;
    const pitch = getPitch();
    if (!el || pitch <= 0) return;

    const max = Math.max(el.scrollWidth - el.clientWidth, 0);
    const target = Math.min(Math.max(Math.round(el.scrollLeft / pitch) * pitch, 0), max);
    alignTo(target);
  }, [alignTo, getPitch]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      slideByOne(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      slideByOne(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      alignTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      alignTo(Math.max(el.scrollWidth - el.clientWidth, 0));
    }
  };

  // Arrastre con el ratón: en táctil dejamos que el navegador use su scroll nativo.
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || event.pointerType !== 'mouse' || event.button !== 0) return;
    if (el.scrollWidth - el.clientWidth <= 2) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    suppressClickRef.current = false;

    // Deja el foco en el carril para poder seguir moviéndolo con el teclado.
    // OJO: aquí NO capturamos el puntero todavía — si se capturara ya en la
    // pulsación, el navegador redirigiría el «click» al carril en vez de al
    // botón de la captura y el visor nunca se abriría. La captura se toma en
    // handlePointerMove, solo cuando el movimiento supera el umbral.
    el.focus({ preventScroll: true });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag || drag.pointerId !== event.pointerId) return;

    // El botón se soltó fuera de la ventana (no llegó pointerup): descartamos.
    if (event.buttons === 0) {
      dragRef.current = null;
      return;
    }

    const delta = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;

      // A partir de aquí sí es un arrastre: capturamos el puntero para seguir
      // recibiendo movimientos aunque salga del carril. El «click» que genere
      // este gesto irá al carril, no al botón, y así no abre el visor.
      drag.moved = true;
      setDragging(true);
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // Si el navegador rechaza la captura, el arrastre sigue funcionando.
      }
    }

    event.preventDefault();
    el.scrollLeft = drag.startScroll - delta;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setDragging(false);

    if (el) {
      try {
        if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      } catch {
        // La captura ya se liberó sola (p. ej. el puntero salió de la ventana).
      }
    }

    if (drag.moved) {
      // Al soltar, el navegador emite un clic que no debe abrir el visor.
      suppressClickRef.current = true;
      if (suppressTimerRef.current !== null) window.clearTimeout(suppressTimerRef.current);
      suppressTimerRef.current = window.setTimeout(() => {
        suppressTimerRef.current = null;
        suppressClickRef.current = false;
      }, 250);

      snapToNearest();
    }
  };

  // Todavía no hay capturas subidas: mostramos el marco con un aviso claro.
  if (total === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
            <path d="M17 5h3v2a3 3 0 0 1-3 3" />
            <path d="M7 5H4v2a3 3 0 0 0 3 3" />
          </svg>
        </span>
        <p className={styles.emptyTitle}>Todavía no hay capturas</p>
        <p className={styles.emptyText}>
          Sube las fotos de tus picks ganados a{' '}
          <code className={styles.emptyCode}>public/images/ganados</code> y aparecerán aquí
          automáticamente.
        </p>
      </div>
    );
  }

  const thumbRatio = Math.max(visibleRatio, MIN_THUMB_RATIO);
  const thumbShift = thumbRatio >= 1 ? 0 : (progress * (1 - thumbRatio)) / thumbRatio;

  return (
    <div className={styles.wrap}>
      <div className={styles.viewport}>
        <div
          ref={scrollerRef}
          className={`${styles.scroller} ${dragging ? styles.scrollerDragging : ''}`}
          role="region"
          aria-roledescription="carrusel"
          aria-label={label}
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDragStart={(event) => event.preventDefault()}
        >
          {images.map((src, i) => (
            <div
              key={src}
              className={styles.slide}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
            >
              <button
                type="button"
                className={styles.slideButton}
                onClick={(event) => openLightbox(i, event.currentTarget)}
                aria-label={`Ampliar la captura ${i + 1} de ${total}`}
              >
                <Image
                  src={src}
                  alt={`${label} — captura ${i + 1} de ${total}`}
                  fill
                  sizes="(max-width: 720px) 46vw, 320px"
                  className={styles.image}
                  draggable={false}
                />
                <span className={styles.zoomBadge} aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                    <path d="M11 8v6" />
                    <path d="M8 11h6" />
                  </svg>
                </span>
              </button>
            </div>
          ))}
        </div>

        <span className={styles.counter}>
          {total === 1 ? '1 captura' : `${total} capturas`}
        </span>

        {overflowing && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={() => slideByOne(-1)}
              disabled={atStart}
              aria-label="Capturas anteriores"
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
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={() => slideByOne(1)}
              disabled={atEnd}
              aria-label="Capturas siguientes"
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div
        className={`${styles.progress} ${overflowing ? '' : styles.progressIdle}`}
        aria-hidden="true"
      >
        <span
          className={styles.progressThumb}
          style={{
            width: `${thumbRatio * 100}%`,
            transform: `translateX(${thumbShift * 100}%)`,
          }}
        />
      </div>

      {/* Visor ampliado: se monta solo mientras hay una captura abierta. */}
      {lightboxIndex !== null && (
        <WinsLightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={closeLightbox}
          label={label}
          returnFocusTo={lastTriggerRef.current}
        />
      )}
    </div>
  );
};