// ─── Form Validators ──────────────────────────────────────────────────────────

import { PICK_CONFIG } from '@/constants/config';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: 'El email es obligatorio' };
  if (!re.test(email)) return { valid: false, error: 'Email no válido' };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: 'La contraseña es obligatoria' };
  if (password.length < 8) return { valid: false, error: 'Mínimo 8 caracteres' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Debe contener una mayúscula' };
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Debe contener un número' };
  return { valid: true };
}

export function validateUsername(username: string): ValidationResult {
  if (!username) return { valid: false, error: 'El nombre de usuario es obligatorio' };
  if (username.length < 3) return { valid: false, error: 'Mínimo 3 caracteres' };
  if (username.length > 20) return { valid: false, error: 'Máximo 20 caracteres' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Solo letras, números y guiones bajos' };
  }
  return { valid: true };
}

export function validateOdds(odds: number): ValidationResult {
  if (!odds) return { valid: false, error: 'Las cuotas son obligatorias' };
  if (odds < PICK_CONFIG.MIN_ODDS) {
    return { valid: false, error: `Cuota mínima: ${PICK_CONFIG.MIN_ODDS}` };
  }
  if (odds > PICK_CONFIG.MAX_ODDS) {
    return { valid: false, error: `Cuota máxima: ${PICK_CONFIG.MAX_ODDS}` };
  }
  return { valid: true };
}

export function validateStake(stake: number): ValidationResult {
  if (!stake) return { valid: false, error: 'El importe es obligatorio' };
  if (stake < PICK_CONFIG.MIN_STAKE) {
    return { valid: false, error: `Importe mínimo: ${PICK_CONFIG.MIN_STAKE}€` };
  }
  if (stake > PICK_CONFIG.MAX_STAKE) {
    return { valid: false, error: `Importe máximo: ${PICK_CONFIG.MAX_STAKE}€` };
  }
  return { valid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} es obligatorio` };
  }
  return { valid: true };
}
