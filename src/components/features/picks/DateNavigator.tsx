'use client';

import React, { useState, useMemo } from 'react';
import styles from './DateNavigator.module.css';

interface DateNavigatorProps {
  selectedDate: string | null; // YYYY-MM-DD or null for "all"
  onSelectDate: (date: string | null) => void;
  pickCountsByDate?: Record<string, number>;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
  pickCountsByDate = {},
}) => {
  // Fecha central de visualización (por defecto hoy)
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  // Genera un rango de 7 días alrededor del anchorDate
  const visibleDays = useMemo(() => {
    const days = [];
    // 3 días antes y 3 días después del anchor
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(anchorDate);
      d.setDate(d.getDate() + offset);
      const isoStr = d.toISOString().split('T')[0];

      const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString('es-ES', { month: 'short' });
      const isToday = isoStr === todayStr;

      days.push({
        dateStr: isoStr,
        weekday,
        dayNum,
        monthShort,
        isToday,
      });
    }
    return days;
  }, [anchorDate, todayStr]);

  const handlePrevDays = () => {
    const next = new Date(anchorDate);
    next.setDate(next.getDate() - 3);
    setAnchorDate(next);
  };

  const handleNextDays = () => {
    const next = new Date(anchorDate);
    next.setDate(next.getDate() + 3);
    setAnchorDate(next);
  };

  const handleGoToday = () => {
    const today = new Date();
    setAnchorDate(today);
    onSelectDate(todayStr);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const [year, month, day] = val.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      setAnchorDate(d);
      onSelectDate(val);
    }
  };

  // Texto legible del día seleccionado
  const selectedDisplayLabel = useMemo(() => {
    if (!selectedDate) return 'Mostrando todos los pronósticos';
    if (selectedDate === todayStr) return 'Hoy, ' + new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [selectedDate, todayStr]);

  return (
    <div className={styles.wrapper}>
      {/* Top action bar */}
      <div className={styles.topBar}>
        <div className={styles.currentDateLabel}>
          <span className={styles.calendarIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span>{selectedDisplayLabel}</span>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={`${styles.allBtn} ${selectedDate === null ? styles.allBtnActive : ''}`}
            onClick={() => onSelectDate(null)}
          >
            Todos los días
          </button>

          <button
            type="button"
            className={styles.todayBtn}
            onClick={handleGoToday}
          >
            Ir a Hoy
          </button>

          {/* Calendar date picker icon */}
          <div className={styles.calendarPickerWrapper} title="Seleccionar fecha en calendario">
            <button type="button" className={styles.calendarPickerBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
            <input
              type="date"
              className={styles.hiddenDateInput}
              value={selectedDate || todayStr}
              onChange={handleCustomDateChange}
            />
          </div>
        </div>
      </div>

      {/* Nav row with arrows and horizontal day buttons */}
      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.arrowBtn}
          onClick={handlePrevDays}
          title="Días anteriores"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className={styles.daysStrip}>
          {visibleDays.map((day) => {
            const isSelected = selectedDate === day.dateStr;
            const count = pickCountsByDate[day.dateStr] || 0;

            return (
              <button
                key={day.dateStr}
                type="button"
                className={`${styles.dayCard} ${isSelected ? styles.dayCardActive : ''}`}
                onClick={() => onSelectDate(day.dateStr)}
              >
                {day.isToday ? (
                  <span className={styles.todayBadge}>HOY</span>
                ) : (
                  <span className={styles.weekday}>{day.weekday}</span>
                )}
                <span className={styles.dayNum}>{day.dayNum} {day.monthShort}</span>

                {count > 0 && (
                  <span className={styles.pickCountBadge} title={`${count} picks este día`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.arrowBtn}
          onClick={handleNextDays}
          title="Días siguientes"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};
