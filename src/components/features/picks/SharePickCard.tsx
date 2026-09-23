'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Pick } from '@/types/pick';
import { APP_CONFIG } from '@/constants/config';
import styles from './SharePickCard.module.css';

/* ─── Constantes de dibujo ─────────────────────────────────────────────────── */

const CARD_W = 1080;
const CARD_H = 1080;
const BG_TOP = '#0a1622';
const BG_BOTTOM = '#0c1f2e';
const SURFACE = '#0e2233';
const SURFACE_BORDER = '#1d3a4f';
const CYAN = '#38bdf8';
const WHITE = '#f1f5f9';
const MUTED = '#8aa0b4';

const RESULT_META: Record<string, { label: string; color: string }> = {
  win: { label: 'GANADO', color: '#2fbf71' },
  loss: { label: 'PERDIDO', color: '#e05252' },
  pending: { label: 'PENDIENTE', color: '#f0a52c' },
  push: { label: 'NULO', color: '#7f9db5' },
};

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** Carga una imagen con CORS anónimo; si falla (host sin CORS) devuelve null. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

function pill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  filled = false,
): number {
  ctx.font = '700 22px Inter, system-ui, sans-serif';
  const w = ctx.measureText(text).width + 44;
  const h = 44;
  roundRect(ctx, x, y, w, h, 22);
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
  } else {
    ctx.fillStyle = `${color}26`;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = 'left';
  return w;
}

/** Escudo del equipo: imagen si hay CORS, si no iniciales sobre caja blanca. */
async function drawTeamBadge(
  ctx: CanvasRenderingContext2D,
  name: string,
  logoUrl: string | undefined,
  cx: number,
  y: number,
  size: number,
): Promise<void> {
  const r = size / 2;
  const cy = y + r;

  // Caja blanca circular
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  let drawn = false;
  if (logoUrl) {
    const img = await loadImage(logoUrl);
    if (img) {
      // La imagen cubre todo el círculo (cover, sin margen)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      ctx.restore();
      drawn = true;
    }
  }
  if (!drawn) {
    ctx.fillStyle = '#1e293b';
    ctx.font = '800 40px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.slice(0, 3).toUpperCase(), cx, cy + 1);
    ctx.textAlign = 'left';
  }

  // Anillo blanco de 2px (equivalente a escala de la tarjeta)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();
}

/* ─── Render de la tarjeta ─────────────────────────────────────────────────── */

async function renderPickCard(pick: Pick): Promise<HTMLCanvasElement> {
  // Esperamos a la fuente Inter para que el canvas la use igual que la web.
  try {
    await document.fonts.ready;
  } catch {
    /* sin document.fonts (SSR/tests) seguimos con la fuente del sistema */
  }

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no soportado');

  const home = pick.match?.homeTeam;
  const away = pick.match?.awayTeam;
  const homeName = home?.name || home?.shortName || 'Local';
  const awayName = away?.name || away?.shortName || 'Visitante';
  const result = RESULT_META[pick.result] ?? RESULT_META.pending;

  const dateStr = (() => {
    const src = pick.match?.startTime || pick.createdAt;
    if (!src) return '';
    try {
      const d = new Date(src);
      if (Number.isNaN(d.getTime())) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year}  ·  ${hours}:${minutes}`;
    } catch {
      return '';
    }
  })();

  // Fondo: imagen de marca (images/fondo.jpg) en modo "cover" + velo oscuro para legibilidad
  const fondo = await loadImage('/images/fondo.jpg');
  if (fondo) {
    const scale = Math.max(CARD_W / fondo.width, CARD_H / fondo.height);
    const w = fondo.width * scale;
    const h = fondo.height * scale;
    ctx.drawImage(fondo, (CARD_W - w) / 2, (CARD_H - h) / 2, w, h);
    ctx.fillStyle = 'rgba(8, 20, 32, 0.86)';
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  } else {
    // Fallback: degradado si la imagen no carga
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, BG_TOP);
    bg.addColorStop(1, BG_BOTTOM);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  }

  const glow = ctx.createRadialGradient(CARD_W / 2, -80, 60, CARD_W / 2, -80, 700);
  glow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
  glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, 620);

  const M = 70;
  ctx.textBaseline = 'middle';

  // Logo de RogiPicks (images/logo.png, sin problemas de CORS), protagonista de la cabecera
  const logo = await loadImage('/images/logo.png');
  if (logo) {
    const h = 104;
    const w = Math.min((logo.width / logo.height) * h, 340);
    ctx.drawImage(logo, M, 52, w, h);
  } else {
    ctx.fillStyle = WHITE;
    ctx.font = '800 50px Inter, system-ui, sans-serif';
    ctx.fillText('RogiPicks', M, 106);
  }

  // Píldora de sección, alineada a la derecha de la cabecera
  const sectionText = 'ANÁLISIS DE PICK';
  ctx.font = '700 22px Inter, system-ui, sans-serif';
  const sectionW = ctx.measureText(sectionText).width + 44;
  pill(ctx, sectionText, CARD_W - M - sectionW, 82, CYAN);

  // ── Enfrentamiento ──
  const badgeY = 230;
  const badgeSize = 180;
  // Escudos más cerca del centro (inset lateral mayor que el margen de la tarjeta)
  const badgeInset = 150;
  const homeCx = badgeInset + badgeSize / 2;
  const awayCx = CARD_W - badgeInset - badgeSize / 2;
  await drawTeamBadge(ctx, homeName, home?.logoUrl, homeCx, badgeY, badgeSize);
  await drawTeamBadge(ctx, awayName, away?.logoUrl, awayCx, badgeY, badgeSize);

  ctx.textAlign = 'center';
  ctx.fillStyle = WHITE;
  ctx.font = '800 36px Inter, system-ui, sans-serif';
  ctx.fillText(homeName.slice(0, 26).toUpperCase(), homeCx, badgeY + badgeSize + 56);
  ctx.fillText(awayName.slice(0, 26).toUpperCase(), awayCx, badgeY + badgeSize + 56);

  // Competición encima de la fecha y la hora
  const competition = pick.match?.competition?.trim();
  if (competition) {
    ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
    ctx.font = '700 24px Inter, system-ui, sans-serif';
    ctx.fillText(competition.slice(0, 30).toUpperCase(), CARD_W / 2, badgeY + 4);
  }

  if (dateStr) {
    ctx.fillStyle = CYAN;
    ctx.font = '600 30px Inter, system-ui, sans-serif';
    ctx.fillText(dateStr, CARD_W / 2, badgeY + (competition ? 44 : 40));
  }
  ctx.fillStyle = 'rgba(138, 160, 180, 0.8)';
  ctx.font = '800 56px Inter, system-ui, sans-serif';
  ctx.fillText('VS', CARD_W / 2, badgeY + (competition ? 122 : 118));
  ctx.textAlign = 'left';

  // ── Caja de pronóstico (protagonista de la tarjeta) ──
  const selY = 560;
  const selH = 260;
  roundRect(ctx, M, selY, CARD_W - M * 2, selH, 28);
  ctx.fillStyle = 'rgba(14, 34, 51, 0.92)';
  ctx.fill();
  ctx.strokeStyle = SURFACE_BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Acento lateral cian
  ctx.fillStyle = CYAN;
  roundRect(ctx, M + 28, selY + 44, 6, selH - 88, 3);
  ctx.fill();

  ctx.fillStyle = MUTED;
  ctx.font = '700 24px Inter, system-ui, sans-serif';
  ctx.fillText('PRONÓSTICO', M + 64, selY + 62);

  ctx.fillStyle = WHITE;
  const selectionSize = pick.selection.length > 24 ? 40 : 46;
  ctx.font = `800 ${selectionSize}px Inter, system-ui, sans-serif`;
  const selLines = wrapText(ctx, pick.selection, 540, 2);
  selLines.forEach((line, i) => {
    ctx.fillText(line, M + 64, selY + 142 + i * (selectionSize + 10));
  });

  ctx.textAlign = 'right';
  ctx.fillStyle = MUTED;
  ctx.font = '700 24px Inter, system-ui, sans-serif';
  ctx.fillText('CUOTA', CARD_W - M - 54, selY + 62);
  ctx.fillStyle = CYAN;
  ctx.font = '900 88px Inter, system-ui, sans-serif';
  ctx.save();
  ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
  ctx.shadowBlur = 34;
  ctx.fillText(`${pick.odds.toFixed(2)}x`, CARD_W - M - 54, selY + 160);
  ctx.restore();
  ctx.textAlign = 'left';

  // ── Pie de marca ──
  ctx.strokeStyle = SURFACE_BORDER;
  ctx.beginPath();
  ctx.moveTo(M, 930);
  ctx.lineTo(CARD_W - M, 930);
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = '800 34px Inter, system-ui, sans-serif';
  ctx.fillText('RogiPicks', M, 982);
  ctx.fillStyle = MUTED;
  ctx.font = '500 24px Inter, system-ui, sans-serif';
  ctx.fillText('Picks deportivos con análisis y transparencia', M, 1020);

  ctx.textAlign = 'right';
  ctx.fillStyle = MUTED;
  ctx.font = '500 22px Inter, system-ui, sans-serif';
  ctx.fillText('+18. Juega con responsabilidad.', CARD_W - M, 1020);
  ctx.textAlign = 'left';

  return canvas;
}

/* ─── Componente ───────────────────────────────────────────────────────────── */

type ShareStatus = 'idle' | 'generating' | 'ready' | 'copied' | 'error';

export function SharePickCard({ pick }: { pick: Pick }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ShareStatus>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/picks/${pick.id}` : '';

  const generate = useCallback(async () => {
    setStatus('generating');
    try {
      const canvas = await renderPickCard(pick);
      canvasRef.current = canvas;
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.92));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [pick]);

  const handleOpen = () => {
    setOpen(true);
    void generate();
  };

  // Evitar el scroll de fondo mientras el modal está abierto
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `rogipicks-pick-${pick.id}.jpg`;
    a.click();
  };

  const share = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92),
    );
    const file = blob ? new File([blob], 'rogipicks-pick.jpg', { type: 'image/jpeg' }) : null;
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
    if (file && nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title: 'RogiPicks · Pick deportivo',
          text: `${pick.selection} @ ${pick.odds.toFixed(2)}x — análisis completo en RogiPicks`,
          url,
        });
        return;
      } catch {
        /* El usuario canceló el share nativo: pasamos al fallback */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  };

  const statusText =
    status === 'generating'
      ? 'Generando la tarjeta…'
      : status === 'copied'
        ? 'Tu navegador no permite adjuntar la imagen: hemos copiado el enlace del pick para que lo pegues donde quieras.'
        : status === 'ready'
          ? 'La tarjeta está lista para compartir.'
          : status === 'error'
            ? 'No se pudo generar la tarjeta. Inténtalo de nuevo.'
            : '';

  return (
    <>
      <button
        type="button"
        className={styles.shareBtn}
        onClick={handleOpen}
        aria-label="Compartir pick"
        title="Compartir pick"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Tarjeta para compartir"
          onClick={() => setOpen(false)}
        >
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.head}>
              <div>
                <span className={styles.eyebrow}>Análisis de pick</span>
                <h3 className={styles.title}>Tarjeta para compartir</h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`Tarjeta para compartir del pick ${pick.selection}`}
                className={styles.preview}
              />
            ) : (
              <p className={styles.status}>Generando la tarjeta…</p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.shareAction}`}
                onClick={share}
                disabled={status !== 'ready'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
                </svg>
                Compartir
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.downloadAction}`}
                onClick={download}
                disabled={status !== 'ready'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
                Descargar JPG
              </button>
            </div>

            <p className={`${styles.status} ${status === 'error' ? styles.statusError : ''}`}>
              {statusText}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

