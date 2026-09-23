'use client';

import React from 'react';
import styles from './DatePill.module.css';

interface DatePillProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DAY_NAMES = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
const MIN_DATE = new Date(2026, 8, 23); // Inicio del sitio: 23/09/2026
const MIN_DATE_STR = '2026-09-23';

export const DatePill: React.FC<DatePillProps> = ({ currentDate, onDateChange }) => {
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const weekday = DAY_NAMES[currentDate.getDay()];
  const displayStr = `${day}/${month} ${weekday}`;

  // YYYY-MM-DD for native input
  const year = currentDate.getFullYear();
  const inputVal = `${year}-${month}-${day}`;

  const isAtMinDate = React.useMemo(() => {
    const curZero = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
    const minZero = new Date(MIN_DATE.getFullYear(), MIN_DATE.getMonth(), MIN_DATE.getDate()).getTime();
    return curZero <= minZero;
  }, [currentDate]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAtMinDate) return;
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    if (prev.getTime() < MIN_DATE.getTime()) {
      onDateChange(new Date(MIN_DATE));
    } else {
      onDateChange(prev);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const [y, m, d] = val.split('-').map(Number);
      const newD = new Date(y, m - 1, d);
      if (newD.getTime() < MIN_DATE.getTime()) {
        onDateChange(new Date(MIN_DATE));
      } else {
        onDateChange(newD);
      }
    }
  };

  return (
    <div className={styles.datePill}>
      {/* Left Chevron (Disabled at min date) */}
      <button
        type="button"
        className={`${styles.arrowBtn} ${isAtMinDate ? styles.arrowBtnDisabled : ''}`}
        onClick={handlePrev}
        disabled={isAtMinDate}
        title={isAtMinDate ? 'Fecha inicial alcanzada' : 'Día anterior'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* Center Date & Calendar Icon */}
      <div className={styles.centerContent} title="Hacer clic para cambiar fecha">
        <span className={styles.calendarIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
            <line x1="16" y1="2" x2="16" y2="5" />
            <line x1="8" y1="2" x2="8" y2="5" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <circle cx="8" cy="13" r="1" fill="currentColor" />
            <circle cx="12" cy="13" r="1" fill="currentColor" />
            <circle cx="16" cy="13" r="1" fill="currentColor" />
            <circle cx="8" cy="17" r="1" fill="currentColor" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
            <circle cx="16" cy="17" r="1" fill="currentColor" />
          </svg>
        </span>
        <span className={styles.dateText}>{displayStr}</span>

        {/* Transparent date picker input overlay */}
        <input
          type="date"
          className={styles.hiddenDateInput}
          min={MIN_DATE_STR}
          value={inputVal}
          onChange={handleInputChange}
        />
      </div>

      {/* Right Chevron */}
      <button
        type="button"
        className={styles.arrowBtn}
        onClick={handleNext}
        title="Día siguiente"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};
