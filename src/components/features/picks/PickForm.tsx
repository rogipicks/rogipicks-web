'use client';

import React, { useState } from 'react';
import type { PickConfidence } from '@/types/pick';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './PickForm.module.css';

export interface NewPickFormData {
  matchTeams: string;
  sportCategory: string;
  selection: string;
  odds: number;
  stake: number;
  confidence: PickConfidence;
  analysis: string;
}

interface PickFormProps {
  onSubmit: (data: NewPickFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PickForm: React.FC<PickFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<NewPickFormData>({
    matchTeams: '',
    sportCategory: 'football',
    selection: '',
    odds: 1.85,
    stake: 2,
    confidence: 3,
    analysis: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.matchTeams.trim()) {
      newErrors.matchTeams = 'Indica los equipos o participantes del partido';
    }
    if (!formData.selection.trim()) {
      newErrors.selection = 'Indica el pronóstico o selección';
    }
    if (formData.odds <= 1.01) {
      newErrors.odds = 'La cuota debe ser mayor a 1.01';
    }
    if (formData.stake < 0.5 || formData.stake > 10) {
      newErrors.stake = 'El stake debe estar entre 0.5 y 10';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Deporte</label>
        <select
          className={styles.select}
          value={formData.sportCategory}
          onChange={(e) => setFormData({ ...formData, sportCategory: e.target.value })}
        >
          <option value="football">⚽ Fútbol</option>
          <option value="basketball">🏀 Baloncesto</option>
          <option value="tennis">🎾 Tenis</option>
          <option value="ufc">🥊 UFC / MMA</option>
          <option value="other">🎯 Otro Deporte</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="Evento / Partido (Local vs Visitante)"
          placeholder="Ej: Real Madrid vs Manchester City"
          value={formData.matchTeams}
          onChange={(e) => setFormData({ ...formData, matchTeams: e.target.value })}
          error={errors.matchTeams}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="Selección / Pronóstico"
          placeholder="Ej: Ambos equipos anotan y más de 2.5 goles"
          value={formData.selection}
          onChange={(e) => setFormData({ ...formData, selection: e.target.value })}
          error={errors.selection}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <Input
            label="Cuota decimal"
            type="number"
            step="0.01"
            min="1.01"
            placeholder="1.90"
            value={formData.odds.toString()}
            onChange={(e) => setFormData({ ...formData, odds: parseFloat(e.target.value) || 0 })}
            error={errors.odds}
          />
        </div>
        <div className={styles.col}>
          <Input
            label="Stake (1 a 10 unidades)"
            type="number"
            step="0.5"
            min="0.5"
            max="10"
            placeholder="2"
            value={formData.stake.toString()}
            onChange={(e) => setFormData({ ...formData, stake: parseFloat(e.target.value) || 1 })}
            error={errors.stake}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Nivel de Confianza (1 a 5 estrellas)</label>
        <div className={styles.starSelector}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.starBtn} ${formData.confidence >= star ? styles.starActive : ''}`}
              onClick={() => setFormData({ ...formData, confidence: star as PickConfidence })}
            >
              ★
            </button>
          ))}
          <span className={styles.confidenceText}>
            {formData.confidence}/5 estrellas
          </span>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Argumentación / Análisis (Opcional)</label>
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="Explica las claves de tu pronóstico: bajas de jugadores, estadísticas recientes..."
          value={formData.analysis}
          onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
        />
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Publicando...' : 'Publicar Pick 🎯'}
        </Button>
      </div>
    </form>
  );
};
