'use client';

import { useState, useEffect } from 'react';
import type { Reto, RetoStepResult } from '@/types/reto';
import { getLocalRetos, saveLocalRetos, subscribeToRetos } from '@/lib/utils/retosSync';
import { MOCK_RETOS } from '@/lib/data/mockRetos';
import { APP_CONFIG } from '@/constants/config';
import styles from './retos.module.css';

/** Etiqueta visible del estado de cada paso del reto. */
const STEP_RESULT_LABELS: Record<RetoStepResult, string> = {
  win: 'Ganado',
  loss: 'Perdido',
  pending: 'Pendiente',
};

const STEP_RESULT_ICONS: Record<RetoStepResult, string> = {
  win: '✅',
  loss: '❌',
  pending: '⏳',
};

/** Formatea la fecha del partido igual que en los picks: 20.09.2026 04:05 */
function formatMatchDateTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Estado global del reto, deducido de los resultados de sus pasos:
 * perdido si algún paso está perdido, ganado si todos están ganados,
 * pendiente en cualquier otro caso.
 */
function getRetoResult(reto: Reto): RetoStepResult {
  const steps = reto.steps ?? [];
  if (steps.length === 0) return 'pending';
  if (steps.some((s) => (s.result ?? 'pending') === 'loss')) return 'loss';
  if (steps.every((s) => s.result === 'win')) return 'win';
  return 'pending';
}

/** Tarjeta + badge de esquina al estilo de los picks, según el estado del reto. */
function getRetoStatus(reto: Reto) {
  const result = getRetoResult(reto);
  return {
    result,
    cardClass: {
      win: styles.cardWin,
      loss: styles.cardLoss,
      pending: styles.cardPending,
    }[result],
    badgeClass: `${styles.resultBadge} ${
      { win: styles.badgeWin, loss: styles.badgeLoss, pending: styles.badgePending }[result]
    }`,
    label: `${STEP_RESULT_ICONS[result]} ${STEP_RESULT_LABELS[result]}`,
  };
}

/**
 * Progreso del reto derivado de los pasos acabados (ganados o perdidos):
 * empieza en 0%, sube con cada paso marcado y llega al 100% cuando todos
 * los pasos están acabados. El paso visible es el siguiente al último
 * acabado (con tope en el último paso).
 */
function getRetoProgress(reto: Reto) {
  const steps = reto.steps ?? [];
  const total = steps.length;
  if (total === 0) {
    // Datos antiguos sin pasos: usa los valores guardados.
    return {
      finished: 0,
      stepLabel: reto.currentStep,
      pct: Math.min(100, Math.max(0, reto.progress ?? 0)),
    };
  }
  const finished = steps.filter((s) => s.result === 'win' || s.result === 'loss').length;
  return {
    finished,
    stepLabel: `Paso ${Math.min(finished + 1, total)} de ${total}`,
    pct: Math.round((finished / total) * 100),
  };
}

interface RetosListProps {
  initialRetos: Reto[];
}

export function RetosList({ initialRetos }: RetosListProps) {
  const [retos, setRetos] = useState<Reto[]>(() => {
    const cached = getLocalRetos();
    return cached && cached.length > 0 ? cached : initialRetos;
  });

  // Modal de pasos: id del reto abierto + índice del paso que se está viendo
  const [openRetoId, setOpenRetoId] = useState<string | null>(null);
  const [viewStepIndex, setViewStepIndex] = useState(0);

  const openReto = retos.find((r) => r.id === openRetoId) ?? null;
  const openSteps = openReto?.steps ?? [];
  const openStep = openSteps[viewStepIndex] ?? null;
  // Pasos ya desbloqueados: los acabados + el actual. Los futuros no se muestran.
  const openFinished = openSteps.filter(
    (s) => s.result === 'win' || s.result === 'loss'
  ).length;
  const revealedCount =
    openSteps.length > 0 ? Math.min(openFinished + 1, openSteps.length) : 0;

  useEffect(() => {
    // 1. Fetch fresh from API
    const fetchFresh = async () => {
      try {
        const res = await fetch('/api/retos', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setRetos(json.data);
            saveLocalRetos(json.data);
          }
        }
      } catch (e) {
        console.error('Error fetching retos:', e);
      }
    };

    fetchFresh();

    // 2. Subscribe to real-time updates from Admin
    const unsub = subscribeToRetos((newRetos) => {
      setRetos(newRetos);
    });

    return unsub;
  }, []);

  if (retos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No hay retos publicados actualmente.</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>¡Vuelve pronto para nuevos desafíos!</p>
      </div>
    );
  }

  return (
    <>
    <div className={styles.grid}>
      {retos.map((reto) => {
        const status = getRetoStatus(reto);
        const progress = getRetoProgress(reto);

        // Interruptor "Telegram?" del admin: si está activo, el reto se sigue
        // en Telegram y nunca se abre el modal del paso actual.
        const telegramMode = reto.telegramMode === true;
        const telegramHref = (reto.telegramUrl || '').trim() || APP_CONFIG.telegramUrl;

        // Al abrir el modal se muestra el paso actual (el siguiente al último acabado)
        const handleOpen = () => {
          if (telegramMode) {
            window.open(telegramHref, '_blank', 'noopener,noreferrer');
            return;
          }
          setOpenRetoId(reto.id);
          setViewStepIndex(Math.min(progress.finished, (reto.steps?.length ?? 1) - 1));
        };

        return (
          <article
            key={reto.id}
            className={`${styles.card} ${status.cardClass}`}
            onClick={handleOpen}
            role={telegramMode ? 'link' : 'button'}
            tabIndex={0}
            aria-label={
              telegramMode ? `${reto.title} — seguir el reto en Telegram` : undefined
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpen();
            }}
          >
          {reto.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reto.coverImage}
              alt={reto.title}
              className={styles.cardCover}
            />
          )}

          {/* Badge de estado al estilo de los picks: pendiente / ganado / perdido */}
          <span className={status.badgeClass}>{status.label}</span>

          <h2 className={styles.cardTitle}>{reto.title}</h2>
          <p className={styles.cardDesc}>{reto.desc}</p>

          <div className={styles.progressContainer}>
            <div className={styles.progressLabels}>
              <span className={styles.stepText}>{progress.stepLabel}</span>
              <span className={styles.progressPct}>{progress.pct}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress.pct}%` }} />
            </div>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Cantidad Inicial</span>
              <span className={styles.metaValue}>
                {(reto.stake ?? '').replace(/\s*iniciales\s*$/i, '')}
              </span>
            </div>
            <span className={styles.metaArrow} aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Objetivo</span>
              <span className={styles.metaHighlight}>{reto.currentBank}</span>
            </div>
          </div>

          <div className={styles.cardActions}>
            {telegramMode ? (
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btnFollow} ${styles.btnFollowTelegram}`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className={styles.btnFollowIcon} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </span>
                <span>Sigue el reto en Telegram</span>
              </a>
            ) : (
              <button type="button" className={styles.btnFollow} onClick={handleOpen}>
                <span>Saber Más del Reto</span>
              </button>
            )}
          </div>
        </article>
          );
        })}
      </div>

      {/* ── Modal: paso actual del reto ── */}
      {openReto && openStep && (
        <div
          className={styles.modalOverlay}
          onClick={() => setOpenRetoId(null)}
          role="presentation"
        >
          <div
            className={`${styles.modalBox} ${
              styles[`modalBox_${openStep.result || 'pending'}`]
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={`Paso actual de ${openReto.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge de esquina del paso, igual que en los picks */}
            <span
              className={`${styles.stepResultBadge} ${
                styles[`stepResult_${openStep.result || 'pending'}`]
              }`}
            >
              <span aria-hidden="true">{STEP_RESULT_ICONS[openStep.result || 'pending']}</span>
              {STEP_RESULT_LABELS[openStep.result || 'pending']}
            </span>

            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setOpenRetoId(null)}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <h3 className={styles.modalTitle}>{openReto.title}</h3>

            <div className={styles.modalStepHead}>
              <span className={styles.modalStepNum}>
                Paso {viewStepIndex + 1} de {openSteps.length}
              </span>
            </div>

            {/* Equipos del paso */}
            <div className={styles.modalMatch}>
              <div className={styles.modalTeam}>
                <div className={styles.stepLogoBox}>
                  {openStep.homeLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={openStep.homeLogo}
                      alt={openStep.homeTeam || 'Equipo local'}
                      className={styles.stepLogo}
                    />
                  ) : (
                    <span className={styles.stepLogoFallback}>
                      {(openStep.homeTeam || '?').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className={styles.stepTeamName}>
                  {openStep.homeTeam || 'Equipo local'}
                </span>
              </div>

              {/* Centro: fecha y hora del partido + guion, como en los picks */}
              <div className={styles.modalCenter}>
                {openStep.startTime && (
                  <span className={styles.modalDateTime}>
                    {formatMatchDateTime(openStep.startTime)}
                  </span>
                )}
                <span className={styles.modalDash}>-</span>
              </div>

              <div className={styles.modalTeam}>
                <div className={styles.stepLogoBox}>
                  {openStep.awayLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={openStep.awayLogo}
                      alt={openStep.awayTeam || 'Equipo visitante'}
                      className={styles.stepLogo}
                    />
                  ) : (
                    <span className={styles.stepLogoFallback}>
                      {(openStep.awayTeam || '?').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className={styles.stepTeamName}>
                  {openStep.awayTeam || 'Equipo visitante'}
                </span>
              </div>
            </div>

            {/* Apuesta y cuota del paso, como el Pronóstico/Cuota de los picks */}
            {(openStep.bet || openStep.odds) && (
              <div className={styles.modalSelection}>
                <div className={styles.modalSelectionInfo}>
                  <span className={styles.modalSelectionLabel}>Apuesta</span>
                  <span className={styles.modalSelectionValue}>{openStep.bet || '—'}</span>
                </div>
                <div className={styles.modalOdds}>
                  <span className={styles.modalSelectionLabel}>Cuota</span>
                  <span className={styles.modalOddsValue}>{openStep.odds || '—'}</span>
                </div>
              </div>
            )}

            {openStep.desc && <p className={styles.modalDesc}>{openStep.desc}</p>}

            {(openStep.startAmount || openStep.endAmount) && (
              <div className={styles.modalMoney}>
                <div className={styles.stepMoneyItem}>
                  <span className={styles.stepMoneyLabel}>Dinero inicial</span>
                  <span className={styles.stepMoneyValue}>{openStep.startAmount || '—'}</span>
                </div>
                <span className={styles.modalMoneyArrow}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </span>
                <div className={styles.stepMoneyItem}>
                  <span className={styles.stepMoneyLabel}>Al acabar la apuesta</span>
                  <span className={styles.stepMoneyHighlight}>{openStep.endAmount || '—'}</span>
                </div>
              </div>
            )}

            {/* Navegación: flecha izquierda para ver pasos anteriores */}
            <div className={styles.modalNav}>
              {viewStepIndex > 0 ? (
                <button
                  type="button"
                  className={styles.modalNavBtn}
                  onClick={() => setViewStepIndex((i) => Math.max(0, i - 1))}
                  aria-label="Ver paso anterior"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="m11 18-6-6 6-6" />
                  </svg>
                  Paso {viewStepIndex}
                </button>
              ) : (
                <span className={styles.modalNavSpacer} />
              )}

              <span className={styles.modalNavDots}>
                {openSteps.slice(0, revealedCount).map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.modalDot} ${
                      i === viewStepIndex ? styles.modalDotActive : ''
                    } ${i < viewStepIndex ? styles.modalDotDone : ''}`}
                  />
                ))}
              </span>

              {viewStepIndex < revealedCount - 1 ? (
                <button
                  type="button"
                  className={styles.modalNavBtn}
                  onClick={() => setViewStepIndex((i) => Math.min(openSteps.length - 1, i + 1))}
                  aria-label="Ver paso siguiente"
                >
                  Paso {viewStepIndex + 2}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              ) : (
                <span className={styles.modalNavSpacer} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
