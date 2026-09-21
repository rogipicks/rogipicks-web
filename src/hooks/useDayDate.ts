'use client';

import { useEffect, useRef, useState } from 'react';

/** Fecha de hoy a medianoche (hora local). */
export function getTodayMidnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Clave YYYY-MM-DD de una fecha (hora local). */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Estado de fecha que arranca en el día actual (22 hoy, 23 mañana…) y avanza
 * solo a las 00:00 de cada día nuevo. Si el usuario navegó manualmente a otra
 * fecha, se respeta su selección y no se le redirige.
 */
export function useDayDate(): [Date, (d: Date) => void] {
  const [date, setDate] = useState<Date>(() => getTodayMidnight());
  // Último "hoy" conocido: permite distinguir "sigue viendo hoy" de "navegó a otro día"
  const lastTodayRef = useRef<string>(toDateKey(getTodayMidnight()));

  useEffect(() => {
    const check = () => {
      const todayKey = toDateKey(getTodayMidnight());
      if (todayKey === lastTodayRef.current) return;
      setDate((prev) => {
        // Sólo avanza automáticamente si el usuario estaba viendo el día en curso
        return toDateKey(prev) === lastTodayRef.current
          ? getTodayMidnight()
          : prev;
      });
      lastTodayRef.current = todayKey;
    };

    const id = window.setInterval(check, 30_000);
    // Comprobación inmediata al volver a la pestaña (p. ej. tras suspender el equipo)
    document.addEventListener('visibilitychange', check);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  return [date, setDate];
}