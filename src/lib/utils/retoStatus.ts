import type { Reto, RetoStepResult } from '@/types/reto';

/** Etiqueta visible del estado de cada paso del reto. */
export const STEP_RESULT_LABELS: Record<RetoStepResult, string> = {
  win: 'Ganado',
  loss: 'Perdido',
  pending: 'Pendiente',
};

/** Icono del estado de cada paso del reto. */
export const STEP_RESULT_ICONS: Record<RetoStepResult, string> = {
  win: '✅',
  loss: '❌',
  pending: '⏳',
};

/**
 * Estado global del reto, deducido de los resultados de sus pasos:
 * perdido si algún paso está perdido, ganado si todos están ganados,
 * pendiente en cualquier otro caso.
 */
export function getRetoResult(reto: Reto): RetoStepResult {
  const steps = reto.steps ?? [];
  if (steps.length === 0) return 'pending';
  if (steps.some((s) => (s.result ?? 'pending') === 'loss')) return 'loss';
  if (steps.every((s) => s.result === 'win')) return 'win';
  return 'pending';
}

/**
 * Progreso del reto derivado de los pasos acabados (ganados o perdidos):
 * empieza en 0%, sube con cada paso marcado y llega al 100% cuando todos
 * los pasos están acabados.
 */
export function getRetoProgress(reto: Reto): {
  finished: number;
  stepLabel: string;
  pct: number;
} {
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
