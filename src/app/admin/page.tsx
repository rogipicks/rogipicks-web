'use client';

import { useState, useEffect } from 'react';
import type { Pick, PickResult, PickConfidence, PodiumPosition } from '@/types/pick';
import type { Reto, RetoBadgeType, RetoStep, RetoStepResult } from '@/types/reto';
import { getLocalPicks, saveLocalPicks, subscribeToPicks } from '@/lib/utils/picksSync';
import { getLocalRetos, saveLocalRetos, subscribeToRetos } from '@/lib/utils/retosSync';
import { DatePill } from '@/components/features/picks/DatePill';
import styles from './admin.module.css';

const ADMIN_PASSWORD = '1234';

const SPORTS = [
  { id: 'football', label: '⚽ Fútbol', name: 'Fútbol' },
  { id: 'basketball', label: '🏀 Baloncesto', name: 'Baloncesto' },
  { id: 'tennis', label: '🎾 Tenis', name: 'Tenis' },
  { id: 'darts', label: '🎯 Dardos', name: 'Dardos' },
];

const RESULTS: { value: PickResult; label: string }[] = [
  { value: 'pending', label: '⏳ Pendiente' },
  { value: 'win', label: '✅ Acertada' },
  { value: 'loss', label: '❌ Fallada' },
  { value: 'push', label: '↩️ Empuje' },
];

function getPickDate(pick: Pick): string {
  const dateSource = pick.match?.startTime || pick.createdAt;
  if (!dateSource) return '';
  try {
    const d = new Date(dateSource);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

type ExtraPredictionFormItem = {
  id: string;
  bet: string;
  odds: string;
  analysis: string;
};

type LogoField = 'homeLogo' | 'awayLogo';

/**
 * Clave de la zona de logo que está siendo arrastrada.
 * - Formulario de picks: "homeLogo" | "awayLogo"
 * - Pasos del reto: "step:<id del paso>:homeLogo" | "step:<id del paso>:awayLogo"
 * - Portada del reto: "retoCover"
 */
type DragKey = LogoField | 'retoCover' | `step:${string}:${LogoField}`;

type RetoStepFormItem = {
  id: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  desc: string;
  result: RetoStepResult;
  startAmount: string;
  endAmount: string;
  startTime: string;
  bet: string;
  odds: string;
};

// Opciones del estado de cada paso del reto
const RETO_STEP_RESULTS: { value: RetoStepResult; label: string; icon: string }[] = [
  { value: 'pending', label: 'Pendiente', icon: '⏳' },
  { value: 'win', label: 'Ganado', icon: '✅' },
  { value: 'loss', label: 'Perdido', icon: '❌' },
];

type SportFormData = {
  homeTeam: string;
  homeLogo: string;   // base64 data URL
  awayTeam: string;
  awayLogo: string;   // base64 data URL
  startTime: string;
  selection: string;
  odds: string;
  probability: string;
  stake: string;
  confidence: string;
  result: PickResult;
  /** Posición del podio del día: '1' | '2' | '3' | '' (sin podio) */
  podium: string;
  analysis: string;
  extraPredictions: ExtraPredictionFormItem[];
};

type RetoFormData = {
  title: string;
  category: string;
  badge: string;
  badgeType: RetoBadgeType;
  desc: string;
  totalSteps: number;
  startingAmount: string;
  objective: string;
  currentStep: string;
  progress: number;
  stake: string;
  currentBank: string;
  telegramUrl: string;
  /** Interruptor "Telegram?": si está activo el reto se sigue en Telegram. */
  telegramMode: boolean;
  coverImage: string;
  steps: RetoStepFormItem[];
};

const RETO_CATEGORIES = [
  'Futbol',
  'Tenis',
  'Dardos',
  'Basket',
  'Multideporte',
];

const DEFAULT_RETO_STEPS = 5;

// Crea la estructura vacía de un paso del reto (igual que un pick)
const createRetoStepItem = (index: number): RetoStepFormItem => ({
  id: `reto-step-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
  homeTeam: '',
  homeLogo: '',
  awayTeam: '',
  awayLogo: '',
  desc: '',
  result: 'pending',
  startAmount: '',
  endAmount: '',
  startTime: '',
  bet: '',
  odds: '',
});

const buildRetoSteps = (count: number): RetoStepFormItem[] =>
  Array.from({ length: Math.max(0, count) }, (_, i) => createRetoStepItem(i));

// Extrae el número de paso de textos tipo "Paso 4 de 7" / "Paso 2"
const parseStepNumber = (text: string): number => {
  const match = (text || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

// Extrae el total de pasos de textos tipo "Paso 4 de 7"
const parseTotalFromCurrentStep = (text: string): number | null => {
  const match = (text || '').match(/de\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

// Calcula "Paso X de N" y el % de progreso a partir del total de pasos
const buildStepProgress = (stepNumber: number, totalSteps: number) => {
  const total = Math.max(1, totalSteps);
  const current = Math.min(Math.max(1, stepNumber), total);
  return {
    currentStep: `Paso ${current} de ${total}`,
    progress: Math.round((current / total) * 100),
  };
};

const emptyRetoForm = (): RetoFormData => {
  const totalSteps = DEFAULT_RETO_STEPS;
  return {
    title: '',
    category: 'Futbol',
    badge: 'Pendiente',
    badgeType: 'active',
    desc: '',
    totalSteps,
    startingAmount: '',
    objective: '',
    currentStep: `Paso 1 de ${totalSteps}`,
    progress: Math.round(100 / totalSteps),
    stake: '10€',
    currentBank: '10€',
    telegramUrl: '',
    telegramMode: false,
    coverImage: '',
    steps: buildRetoSteps(totalSteps),
  };
};

const emptyFormForSport = (): SportFormData => ({
  homeTeam: '',
  homeLogo: '',
  awayTeam: '',
  awayLogo: '',
  startTime: '',
  selection: '',
  odds: '',
  probability: '',
  stake: '1',
  confidence: '3',
  result: 'pending',
  podium: '',
  analysis: '',
  extraPredictions: [],
});

const buildInitialForms = (): Record<string, SportFormData> => {
  const forms: Record<string, SportFormData> = {};
  SPORTS.forEach((s) => { forms[s.id] = emptyFormForSport(); });
  return forms;
};

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  // Per-sport independent forms
  const [forms, setForms] = useState<Record<string, SportFormData>>(buildInitialForms);
  const [activeSport, setActiveSport] = useState('football');
  const [picks, setPicks] = useState<Pick[]>([]);
  const [retos, setRetos] = useState<Reto[]>([]);
  const [retoForm, setRetoForm] = useState<RetoFormData>(emptyRetoForm);
  const [editingRetoId, setEditingRetoId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'add-reto' | 'list-retos'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<DragKey | null>(null);
  const [adminDate, setAdminDate] = useState<Date>(() => new Date(2026, 8, 20));
  const [showAllDates, setShowAllDates] = useState(false);

  const adminDateStr = `${adminDate.getFullYear()}-${String(adminDate.getMonth() + 1).padStart(2, '0')}-${String(adminDate.getDate()).padStart(2, '0')}`;

  const displayedPicks = showAllDates
    ? picks
    : picks.filter((p) => getPickDate(p) === adminDateStr);

  // Shortcut to current sport's form
  const form = forms[activeSport];

  const fetchAdminPicks = async () => {
    // Caché local solo como pintado inmediato mientras responde la base de datos
    const local = getLocalPicks();
    if (local && local.length > 0) {
      setPicks(local);
    }

    try {
      const res = await fetch('/api/picks', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        // La base de datos es la fuente de verdad: refleja también los borrados
        if (json.success && Array.isArray(json.data)) {
          setPicks(json.data);
          saveLocalPicks(json.data);
          return;
        }
      }
    } catch {
      // fallback
    }
    setPicks(local ?? []);
  };

  const fetchAdminRetos = async () => {
    // Caché local solo como pintado inmediato mientras responde la base de datos
    const local = getLocalRetos();
    if (local && local.length > 0) {
      setRetos(local);
    }

    try {
      const res = await fetch('/api/retos', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        // La base de datos es la fuente de verdad: refleja también los borrados
        if (json.success && Array.isArray(json.data)) {
          setRetos(json.data);
          saveLocalRetos(json.data);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching retos:', e);
    }
    setRetos(local ?? []);
  };

  useEffect(() => {
    if (isAuth) {
      fetchAdminPicks();
      fetchAdminRetos();

      const unsubscribePicks = subscribeToPicks((latest) => {
        setPicks(latest);
      });
      const unsubscribeRetos = subscribeToRetos((latest) => {
        setRetos(latest);
      });

      return () => {
        unsubscribePicks();
        unsubscribeRetos();
      };
    }
  }, [isAuth]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPassword('');
    }
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    // Update only the active sport's form
    setForms((prev) => ({
      ...prev,
      [activeSport]: { ...prev[activeSport], [e.target.name]: e.target.value },
    }));
  };

  /** Límite de píxeles para logos pequeños (se muestran en cajas de ~52px). */
  const MAX_PICK_LOGO_DIMENSION = 256;

  /** Lee la imagen y la reescala/comprime en el cliente antes de guardarla como base64. */
  const readImageAsDataUrl = (
    file: File,
    onLoaded: (dataUrl: string) => void,
    maxDim = 1280
  ) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = (ev.target?.result as string) || '';
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onLoaded(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/webp', 0.82);
        // Nos quedamos con la versión más ligera (si el navegador no codifica WebP, se queda la original)
        onLoaded(compressed && compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
      };
      img.onerror = () => onLoaded(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const processImageFile = (file: File, field: LogoField) => {
    readImageAsDataUrl(
      file,
      (dataUrl) => {
        setForms((prev) => ({
          ...prev,
          [activeSport]: { ...prev[activeSport], [field]: dataUrl },
        }));
      },
      MAX_PICK_LOGO_DIMENSION
    );
  };

  // Logo upload helper
  const handleLogoUpload = (field: LogoField) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processImageFile(file, field);
    };

  // Drag & drop handlers
  const handleDragOver = (key: DragKey) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingField !== key) {
      setDraggingField(key);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingField(null);
  };

  // Devuelve el archivo o la URL que se ha soltado sobre una zona de logo
  const extractDroppedValue = (e: React.DragEvent): File | string | null => {
    // 1. Files dropped directly
    const file = e.dataTransfer.files?.[0];
    if (file) return file;

    // 2. URL dropped from web/browser
    const textUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (
      textUrl &&
      (textUrl.startsWith('http://') || textUrl.startsWith('https://') || textUrl.startsWith('data:image/'))
    ) {
      return textUrl;
    }

    return null;
  };

  const handleDrop = (field: LogoField) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingField(null);

    const value = extractDroppedValue(e);
    if (!value) return;

    if (typeof value === 'string') {
      setForms((prev) => ({
        ...prev,
        [activeSport]: { ...prev[activeSport], [field]: value },
      }));
      return;
    }

    processImageFile(value, field);
  };

  // ── Portada del reto: subida / arrastrar y soltar / quitar ────────────────
  const setRetoCoverImage = (value: string) => {
    setRetoForm((prev) => ({ ...prev, coverImage: value }));
  };

  const handleRetoCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageAsDataUrl(file, setRetoCoverImage);
  };

  const handleRetoCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingField(null);

    const value = extractDroppedValue(e);
    if (!value) return;

    if (typeof value === 'string') {
      setRetoCoverImage(value);
      return;
    }

    readImageAsDataUrl(value, setRetoCoverImage);
  };

  // ── Reto Steps: logo upload / drag & drop ─────────────────────────────────
  const updateRetoStepLogo = (stepId: string, field: LogoField, value: string) => {
    setRetoForm((prev) => ({
      ...prev,
      steps: (prev.steps || []).map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      ),
    }));
  };

  const handleRetoStepLogoUpload = (stepId: string, field: LogoField) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      readImageAsDataUrl(file, (dataUrl) => updateRetoStepLogo(stepId, field, dataUrl), MAX_PICK_LOGO_DIMENSION);
    };

  const handleRetoStepDrop = (stepId: string, field: LogoField) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingField(null);

    const value = extractDroppedValue(e);
    if (!value) return;

    if (typeof value === 'string') {
      updateRetoStepLogo(stepId, field, value);
      return;
    }

    readImageAsDataUrl(value, (dataUrl) => updateRetoStepLogo(stepId, field, dataUrl), MAX_PICK_LOGO_DIMENSION);
  };

  // ── Extra Predictions Handlers ─────────────────────────────────────────────
  const handleAddExtraPrediction = () => {
    setForms((prev) => {
      const current = prev[activeSport];
      const newItem: ExtraPredictionFormItem = {
        id: `extra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        bet: '',
        odds: '',
        analysis: '',
      };
      return {
        ...prev,
        [activeSport]: {
          ...current,
          extraPredictions: [...(current.extraPredictions || []), newItem],
        },
      };
    });
  };

  const handleRemoveExtraPrediction = (id: string) => {
    setForms((prev) => {
      const current = prev[activeSport];
      return {
        ...prev,
        [activeSport]: {
          ...current,
          extraPredictions: (current.extraPredictions || []).filter((item) => item.id !== id),
        },
      };
    });
  };

  const handleExtraPredictionChange = (
    id: string,
    field: 'bet' | 'odds' | 'analysis',
    value: string
  ) => {
    setForms((prev) => {
      const current = prev[activeSport];
      return {
        ...prev,
        [activeSport]: {
          ...current,
          extraPredictions: (current.extraPredictions || []).map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          ),
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sportData = SPORTS.find((s) => s.id === activeSport) || SPORTS[0];
    const oddsNum = parseFloat(form.odds) || 1.01;
    const stakeNum = parseFloat(form.stake) || 1;
    const confNum = (parseInt(form.confidence) || 3) as PickConfidence;
    const podiumRaw = parseInt(form.podium, 10);
    const podiumNum: PodiumPosition | null =
      podiumRaw === 1 || podiumRaw === 2 || podiumRaw === 3 ? podiumRaw : null;
    const startTimeIso = form.startTime ? new Date(form.startTime).toISOString() : new Date().toISOString();

    const cleanedExtraPredictions = (form.extraPredictions || [])
      .filter((ep) => ep.bet.trim() !== '')
      .map((ep) => ({
        id: ep.id,
        bet: ep.bet.trim(),
        odds: ep.odds ? (parseFloat(ep.odds) || ep.odds) : '',
        analysis: ep.analysis?.trim() || '',
      }));

    if (editingId) {
      // Update existing
      const existingPick = picks.find((p) => p.id === editingId);
      const matchId = existingPick?.match?.id || existingPick?.matchId || `m-${Date.now()}`;
      const partial = {
        match: {
          id: matchId,
          sport: { id: `s-${activeSport}`, name: sportData.name, category: activeSport as any },
          homeTeam: {
            id: existingPick?.match?.homeTeam?.id || `t-h-${Date.now()}`,
            name: form.homeTeam,
            shortName: form.homeTeam.slice(0, 3).toUpperCase(),
            sportId: `s-${activeSport}`,
            logoUrl: form.homeLogo || undefined,
          },
          awayTeam: {
            id: existingPick?.match?.awayTeam?.id || `t-a-${Date.now()}`,
            name: form.awayTeam,
            shortName: form.awayTeam.slice(0, 3).toUpperCase(),
            sportId: `s-${activeSport}`,
            logoUrl: form.awayLogo || undefined,
          },
          startTime: startTimeIso,
          status: 'scheduled' as const,
          odds: { homeWin: oddsNum, awayWin: 2.0, updatedAt: new Date().toISOString() },
        },
        selection: form.selection,
        odds: oddsNum,
        stake: stakeNum,
        potentialReturn: parseFloat((stakeNum * oddsNum).toFixed(2)),
        confidence: confNum,
        probability: form.probability || undefined,
        podium: podiumNum,
        result: form.result,
        analysis: form.analysis,
        extraPredictions: cleanedExtraPredictions,
      };

      try {
        await fetch(`/api/picks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partial),
        });
      } catch (err) {
        console.error('Error updating pick in API:', err);
      }

      const updated: Pick[] = picks.map((p) => {
        if (p.id !== editingId) return p;
        return {
          ...p,
          ...partial,
          updatedAt: new Date().toISOString(),
        };
      });
      setPicks(updated);
      saveLocalPicks(updated);
      setEditingId(null);
      setForms((prev) => ({ ...prev, [activeSport]: emptyFormForSport() }));
      setSuccessMsg('✅ Pick actualizado correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      setActiveTab('list');
      return;
    } else {
      // Create new
      const newPick: Pick = {
        id: `pick-admin-${Date.now()}`,
        matchId: `m-${Date.now()}`,
        userId: 'u-admin',
        user: {
          id: 'u-admin',
          username: 'RogiPicks',
          email: 'admin@rogipicks.com',
          role: 'tipster',
          createdAt: new Date().toISOString(),
        },
        match: {
          id: `m-${Date.now()}`,
          sport: { id: `s-${activeSport}`, name: sportData.name, category: activeSport as any },
          homeTeam: {
            id: `t-h-${Date.now()}`,
            name: form.homeTeam,
            shortName: form.homeTeam.slice(0, 3).toUpperCase(),
            sportId: `s-${activeSport}`,
            logoUrl: form.homeLogo || undefined,
          },
          awayTeam: {
            id: `t-a-${Date.now()}`,
            name: form.awayTeam,
            shortName: form.awayTeam.slice(0, 3).toUpperCase(),
            sportId: `s-${activeSport}`,
            logoUrl: form.awayLogo || undefined,
          },
          startTime: new Date(form.startTime).toISOString(),
          status: 'scheduled',
          odds: { homeWin: oddsNum, awayWin: 2.0, updatedAt: new Date().toISOString() },
        },
        selection: form.selection,
        odds: oddsNum,
        stake: stakeNum,
        potentialReturn: parseFloat((stakeNum * oddsNum).toFixed(2)),
        confidence: confNum,
        probability: form.probability || undefined,
        podium: podiumNum,
        result: form.result,
        analysis: form.analysis,
        extraPredictions: cleanedExtraPredictions.length > 0 ? cleanedExtraPredictions : undefined,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await fetch('/api/picks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPick),
        });
      } catch (err) {
        console.error('Error saving pick to API:', err);
      }

      const updated = [newPick, ...picks];
      setPicks(updated);
      saveLocalPicks(updated);
      setSuccessMsg('✅ Pick publicado correctamente');
    }

    // Reset only the active sport's form
    setForms((prev) => ({ ...prev, [activeSport]: emptyFormForSport() }));
    setTimeout(() => setSuccessMsg(''), 3000);
    setActiveTab('list');
  };

  const handleEdit = (pick: Pick) => {
    const sport = pick.match?.sport?.category || 'football';
    let dateStr = '';
    if (pick.match?.startTime) {
      try {
        const d = new Date(pick.match.startTime);
        if (!isNaN(d.getTime())) {
          const pad = (n: number) => String(n).padStart(2, '0');
          dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      } catch { /* ignore */ }
    }

    // Load pick data safely without crashing on null/undefined
    setForms((prev) => ({
      ...prev,
      [sport]: {
        homeTeam: pick.match?.homeTeam?.name || '',
        homeLogo: pick.match?.homeTeam?.logoUrl || '',
        awayTeam: pick.match?.awayTeam?.name || '',
        awayLogo: pick.match?.awayTeam?.logoUrl || '',
        startTime: dateStr,
        selection: pick.selection || '',
        odds: pick.odds != null ? String(pick.odds) : '',
        probability: pick.probability || '',
        stake: pick.stake != null ? String(pick.stake) : '1',
        confidence: pick.confidence != null ? String(pick.confidence) : '3',
        result: pick.result || 'pending',
        podium: pick.podium != null ? String(pick.podium) : '',
        analysis: pick.analysis || '',
        extraPredictions: (pick.extraPredictions || []).map((ep) => ({
          id: ep.id || `extra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          bet: ep.bet || '',
          odds: ep.odds != null ? String(ep.odds) : '',
          analysis: ep.analysis || '',
        })),
      },
    }));
    setActiveSport(sport);
    setEditingId(pick.id);
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    const updated = picks.filter((p) => p.id !== id);
    setPicks(updated);
    saveLocalPicks(updated);
    setSuccessMsg('🗑️ Pick eliminado');
    setTimeout(() => setSuccessMsg(''), 3000);

    try {
      await fetch(`/api/picks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting pick:', err);
    }
  };

  const handleUpdateResult = async (id: string, result: PickResult) => {
    // 1. Actualización inmediata y reactiva
    const updated = picks.map((p) =>
      p.id === id ? { ...p, result, updatedAt: new Date().toISOString() } : p
    );
    setPicks(updated);
    saveLocalPicks(updated);

    // 2. Persistencia en la API
    try {
      await fetch(`/api/picks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
    } catch (err) {
      console.error('Error updating result in API:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForms((prev) => ({ ...prev, [activeSport]: emptyFormForSport() }));
    setActiveTab('list');
  };

  // ── Retos Handlers ────────────────────────────────────────────────────────
  // Convierte los pasos del formulario (strings) al formato guardado
  const buildRetoStepsPayload = (): RetoStep[] =>
    (retoForm.steps || []).map((step, index) => ({
      id: step.id || `reto-step-${index + 1}`,
      homeTeam: step.homeTeam.trim(),
      homeLogo: step.homeLogo.trim() || undefined,
      awayTeam: step.awayTeam.trim(),
      awayLogo: step.awayLogo.trim() || undefined,
      desc: step.desc.trim(),
      result: step.result || 'pending',
      startAmount: step.startAmount.trim(),
      endAmount: step.endAmount.trim(),
      startTime: step.startTime.trim(),
      bet: step.bet.trim(),
      odds: step.odds.trim(),
    }));

  // Campos comunes del reto (se usan tanto al crear como al editar)
  const buildRetoBasePayload = () => {
    const totalSteps = Math.max(1, retoForm.totalSteps);
    const { currentStep, progress } = buildStepProgress(parseStepNumber(retoForm.currentStep), totalSteps);
    return {
      title: retoForm.title.trim(),
      category: retoForm.category.trim() || 'Multideporte',
      badge: retoForm.badge.trim() || 'En Progreso',
      badgeType: retoForm.badgeType,
      desc: retoForm.desc.trim(),
      totalSteps,
      startingAmount: retoForm.startingAmount.trim(),
      objective: retoForm.objective.trim(),
      currentStep,
      progress,
      stake: retoForm.stake.trim() || '10€',
      currentBank: retoForm.currentBank.trim() || '0€',
      telegramUrl: retoForm.telegramUrl.trim(),
      telegramMode: retoForm.telegramMode,
      coverImage: retoForm.coverImage.trim(),
      steps: buildRetoStepsPayload(),
    };
  };

  const handleRetoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retoForm.title.trim()) return;
    const base = buildRetoBasePayload();

    if (editingRetoId) {
      const updatedReto: Reto = {
        id: editingRetoId,
        ...base,
        updatedAt: new Date().toISOString(),
      };

      const updated = retos.map((r) => (r.id === editingRetoId ? { ...r, ...updatedReto } : r));
      setRetos(updated);
      saveLocalRetos(updated);
      setEditingRetoId(null);
      setRetoForm(emptyRetoForm());
      setActiveTab('list-retos');
      setSuccessMsg('✅ Reto actualizado con éxito');
      setTimeout(() => setSuccessMsg(''), 3000);

      try {
        await fetch(`/api/retos/${editingRetoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReto),
        });
      } catch (err) {
        console.error('Error updating reto:', err);
      }
    } else {
      const newReto: Reto = {
        id: `reto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...base,
        createdAt: new Date().toISOString(),
      };

      const updated = [newReto, ...retos];
      setRetos(updated);
      saveLocalRetos(updated);
      setRetoForm(emptyRetoForm());
      setActiveTab('list-retos');
      setSuccessMsg('🎯 Nuevo reto publicado con éxito');
      setTimeout(() => setSuccessMsg(''), 3000);

      try {
        await fetch('/api/retos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReto),
        });
      } catch (err) {
        console.error('Error creating reto:', err);
      }
    }
  };

  const handleEditReto = (reto: Reto) => {
    const existingSteps = Array.isArray(reto.steps) && reto.steps.length > 0 ? reto.steps : null;
    const totalSteps =
      reto.totalSteps ||
      existingSteps?.length ||
      parseTotalFromCurrentStep(reto.currentStep) ||
      DEFAULT_RETO_STEPS;

    // Rellena el array de pasos hasta el número de pasos indicado sin perder los ya creados
    const steps: RetoStepFormItem[] = Array.from({ length: totalSteps }, (_, index) => {
      const step = existingSteps?.[index];
      return {
        id: step?.id || createRetoStepItem(index).id,
        homeTeam: step?.homeTeam || '',
        homeLogo: step?.homeLogo || '',
        awayTeam: step?.awayTeam || '',
        awayLogo: step?.awayLogo || '',
        desc: step?.desc || '',
        result: step?.result || 'pending',
        startAmount: step?.startAmount || '',
        endAmount: step?.endAmount || '',
        startTime: step?.startTime || '',
        bet: step?.bet || '',
        odds: step?.odds || '',
      };
    });

    setRetoForm({
      title: reto.title || '',
      category: reto.category || '',
      badge: reto.badge || '',
      badgeType: reto.badgeType || 'active',
      desc: reto.desc || '',
      totalSteps,
      startingAmount: reto.startingAmount || '',
      objective: reto.objective || '',
      currentStep: reto.currentStep || `Paso 1 de ${totalSteps}`,
      progress: reto.progress || 0,
      stake: reto.stake || '',
      currentBank: reto.currentBank || '',
      telegramUrl: reto.telegramUrl || '',
      telegramMode: reto.telegramMode === true,
      coverImage: reto.coverImage || '',
      steps,
    });
    setEditingRetoId(reto.id);
    setActiveTab('add-reto');
  };

  // Cambia el número de pasos del reto generando/recortando las tarjetas de paso
  const handleRetoStepsCountChange = (rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    const totalSteps = Number.isNaN(parsed) ? 1 : Math.min(30, Math.max(1, parsed));

    setRetoForm((prev) => {
      const current = prev.steps || [];
      const steps: RetoStepFormItem[] = Array.from({ length: totalSteps }, (_, index) => {
        return current[index] || createRetoStepItem(index);
      });
      const { currentStep, progress } = buildStepProgress(parseStepNumber(prev.currentStep), totalSteps);
      return { ...prev, totalSteps, steps, currentStep, progress };
    });
  };

  // Actualiza un campo de texto de un paso del reto
  const handleRetoStepChange = (
    stepId: string,
    field: 'homeTeam' | 'awayTeam' | 'desc' | 'startTime' | 'bet' | 'odds',
    value: string,
  ) => {
    setRetoForm((prev) => ({
      ...prev,
      steps: (prev.steps || []).map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      ),
    }));
  };

  // Cambia el estado (ganado / perdido / pendiente) de un paso
  const handleRetoStepResultChange = (stepId: string, result: RetoStepResult) => {
    setRetoForm((prev) => ({
      ...prev,
      steps: (prev.steps || []).map((step) =>
        step.id === stepId ? { ...step, result } : step
      ),
    }));
  };

  /**
   * Cambia el dinero inicial o final de un paso.
   * Al escribir el dinero final, se rellena automáticamente el dinero inicial
   * del paso siguiente si aún está vacío (encadena la escalera del reto).
   */
  const handleRetoStepMoneyChange = (
    stepId: string,
    field: 'startAmount' | 'endAmount',
    value: string,
  ) => {
    setRetoForm((prev) => {
      const steps = [...(prev.steps || [])];
      const index = steps.findIndex((s) => s.id === stepId);
      if (index === -1) return prev;

      steps[index] = { ...steps[index], [field]: value };

      const nextStep = steps[index + 1];
      if (field === 'endAmount' && nextStep && !nextStep.startAmount.trim()) {
        steps[index + 1] = { ...nextStep, startAmount: value };
      }

      return { ...prev, steps };
    });
  };

  const handleDeleteReto = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este reto?')) return;
    const updated = retos.filter((r) => r.id !== id);
    setRetos(updated);
    saveLocalRetos(updated);
    setSuccessMsg('🗑️ Reto eliminado');
    setTimeout(() => setSuccessMsg(''), 3000);

    try {
      await fetch(`/api/retos/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting reto:', err);
    }
  };

  const handleCancelRetoEdit = () => {
    setEditingRetoId(null);
    setRetoForm(emptyRetoForm());
    setActiveTab('list-retos');
  };

  // ── Password screen ───────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div className={styles.lockScreen}>
        <div className={styles.lockCard}>
          <div className={styles.lockIcon}>🔐</div>
          <h1 className={styles.lockTitle}>Panel de Administración</h1>
          <p className={styles.lockSubtitle}>Introduce la contraseña para continuar</p>
          <form onSubmit={handleLogin} className={styles.lockForm}>
            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.lockInput} ${passwordError ? styles.lockInputError : ''}`}
                autoFocus
              />
              {passwordError && (
                <span className={styles.errorMsg}>Contraseña incorrecta</span>
              )}
            </div>
            <button type="submit" className={styles.lockBtn}>
              Entrar al panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin panel ───────────────────────────────────────────────────────────
  return (
    <div className={styles.adminPage}>
      {/* Header */}
      <header className={styles.adminHeader}>
        <div className={styles.adminHeaderInner}>
          <div className={styles.adminBrand}>
            <span className={styles.adminIcon}>⚡</span>
            <span className={styles.adminBrandText}>RogiPicks</span>
            <span className={styles.adminBadge}>Admin</span>
          </div>
          <div className={styles.adminHeaderRight}>
            <span className={styles.pickCount}>
              {picks.length} picks • {retos.length} retos
            </span>
            <button onClick={() => setIsAuth(false)} className={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.adminMain}>
        {/* Success message */}
        {successMsg && (
          <div className={styles.successBanner}>{successMsg}</div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'add' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('add');
              if (!editingId) {
                setForms((prev) => ({ ...prev, [activeSport]: emptyFormForSport() }));
              }
            }}
          >
            {editingId ? '✏️ Editar Pick' : '➕ Nuevo Pick'}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'list' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 Picks publicados ({picks.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'add-reto' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('add-reto');
              if (!editingRetoId) {
                setRetoForm(emptyRetoForm());
              }
            }}
          >
            {editingRetoId ? '✏️ Editar Reto' : '🎯 Nuevo Reto'}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'list-retos' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('list-retos')}
          >
            🏆 Retos Publicados ({retos.length})
          </button>
        </div>

        {/* ── ADD / EDIT FORM ── */}
        {activeTab === 'add' && (
          <div className={styles.card}>
            {/* ── Cabecera estilo propuesta ── */}
            <div className={styles.formHeader}>
              <div className={styles.formHeaderTop}>
                <span className={styles.formHeaderIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </span>
                <div>
                  <h2 className={styles.formHeaderTitle}>Creación de Picks</h2>
                  <p className={styles.formHeaderSubtitle}>
                    {editingId ? 'Edita los datos del pronóstico seleccionado' : 'Añade un nuevo pronóstico deportivo para tu comunidad'}
                  </p>
                </div>

                {/* Selector "Podium" (1º, 2º, 3º) del podio del día */}
                <div className={styles.podiumPicker}>
                  <span className={styles.podiumPickerLabel}>Podium</span>
                  <div className={styles.podiumPickerOptions} role="group" aria-label="Posición del podio del día">
                    {[1, 2, 3].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        className={`${styles.podiumBtn} ${form.podium === String(pos) ? styles.podiumBtnActive : ''}`}
                        aria-pressed={form.podium === String(pos)}
                        onClick={() =>
                          setForms((prev) => ({
                            ...prev,
                            [activeSport]: {
                              ...prev[activeSport],
                              podium: prev[activeSport].podium === String(pos) ? '' : String(pos),
                            },
                          }))
                        }
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sport tabs */}
              <div className={styles.sportTabsRow}>
                {SPORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.sportTab} ${activeSport === s.id ? styles.sportTabActive : ''}`}
                    onClick={() => setActiveSport(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Teams with logo upload */}
              <div className={styles.formRow}>
                {/* Home team */}
                <div className={styles.field}>
                  <div className={styles.teamBlock}>
                    <span className={styles.logoLabel}>Logo Local</span>
                    <label
                      className={`${styles.logoUploadLabel} ${draggingField === 'homeLogo' ? styles.logoUploadDragging : ''}`}
                      htmlFor={`homeLogo-${activeSport}`}
                      onDragOver={handleDragOver('homeLogo')}
                      onDragEnter={handleDragOver('homeLogo')}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop('homeLogo')}
                      title="Haz clic o arrastra una imagen aquí"
                    >
                      {draggingField === 'homeLogo' ? (
                        <div className={styles.logoPlaceholder} style={{ color: 'hsl(198 100% 50%)' }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>Soltar</span>
                        </div>
                      ) : form.homeLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.homeLogo} alt="Logo local" className={styles.logoPreview} />
                      ) : (
                        <div className={styles.logoPlaceholder}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                          <span>Logo</span>
                        </div>
                      )}
                      <input
                        id={`homeLogo-${activeSport}`}
                        type="file"
                        accept="image/*"
                        className={styles.logoInput}
                        onChange={handleLogoUpload('homeLogo')}
                      />
                    </label>
                    <label className={styles.label}>Equipo local</label>
                    <input
                      type="text"
                      name="homeTeam"
                      value={form.homeTeam}
                      onChange={handleChange}
                      placeholder="Ej: Real Madrid"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                {/* Away team */}
                <div className={styles.field}>
                  <div className={styles.teamBlock}>
                    <span className={styles.logoLabel}>Logo Visitante</span>
                    <label
                      className={`${styles.logoUploadLabel} ${draggingField === 'awayLogo' ? styles.logoUploadDragging : ''}`}
                      htmlFor={`awayLogo-${activeSport}`}
                      onDragOver={handleDragOver('awayLogo')}
                      onDragEnter={handleDragOver('awayLogo')}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop('awayLogo')}
                      title="Haz clic o arrastra una imagen aquí"
                    >
                      {draggingField === 'awayLogo' ? (
                        <div className={styles.logoPlaceholder} style={{ color: 'hsl(198 100% 50%)' }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>Soltar</span>
                        </div>
                      ) : form.awayLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.awayLogo} alt="Logo visitante" className={styles.logoPreview} />
                      ) : (
                        <div className={styles.logoPlaceholder}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                          <span>Logo</span>
                        </div>
                      )}
                      <input
                        id={`awayLogo-${activeSport}`}
                        type="file"
                        accept="image/*"
                        className={styles.logoInput}
                        onChange={handleLogoUpload('awayLogo')}
                      />
                    </label>
                    <label className={styles.label}>Equipo visitante</label>
                    <input
                      type="text"
                      name="awayTeam"
                      value={form.awayTeam}
                      onChange={handleChange}
                      placeholder="Ej: Barcelona"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Date */}
              <div className={styles.field}>
                <label className={styles.label}>Fecha y hora del partido</label>
                <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} className={styles.input} required />
              </div>

              {/* Row 3: Selection */}
              <div className={styles.fieldFull}>
                <label className={styles.label}>Apuesta</label>
                <input type="text" name="selection" value={form.selection} onChange={handleChange} placeholder="Ej: Real Madrid o Empate y +1.5 goles" className={styles.input} required />
              </div>

              {/* Row 4: Odds, Probability, Confidence */}
              <div className={styles.formRow3}>
                <div className={styles.field}>
                  <label className={styles.label}>Cuota</label>
                  <input type="number" name="odds" value={form.odds} onChange={handleChange} placeholder="Ej: 1.85" step="0.01" min="1" className={styles.input} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Probabilidad</label>
                  <input
                    type="text"
                    name="probability"
                    value={form.probability}
                    onChange={handleChange}
                    placeholder="Ej: 80%"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confianza (1–5 ⭐)</label>
                  <select name="confidence" value={form.confidence} onChange={handleChange} className={styles.select} required>
                    <option value="1">1 ⭐ — Muy baja</option>
                    <option value="2">2 ⭐ — Baja</option>
                    <option value="3">3 ⭐ — Media</option>
                    <option value="4">4 ⭐ — Alta</option>
                    <option value="5">5 ⭐ — Muy alta</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Result (solo si edita) */}
              {editingId && (
                <div className={styles.field}>
                  <label className={styles.label}>Resultado</label>
                  <select name="result" value={form.result} onChange={handleChange} className={styles.select}>
                    {RESULTS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 6: Analysis */}
              <div className={styles.fieldFull}>
                <label className={styles.label}>Análisis del partido</label>
                <textarea name="analysis" value={form.analysis} onChange={handleChange} placeholder="Explica los motivos del pronóstico..." className={styles.textarea} rows={4} />
              </div>

              {/* Row 7: Otros pronósticos */}
              <div className={styles.extraSection}>
                <div className={styles.extraHeader}>
                  <div className={styles.extraTitleWrap}>
                    <span className={styles.extraTitle}>
                      🎯 Otros pronósticos
                    </span>
                    {form.extraPredictions && form.extraPredictions.length > 0 && (
                      <span className={styles.extraBadge}>
                        {form.extraPredictions.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExtraPrediction}
                    className={styles.btnAddExtra}
                  >
                    <span>➕</span> Añadir pronóstico
                  </button>
                </div>

                {(!form.extraPredictions || form.extraPredictions.length === 0) ? (
                  <div className={styles.extraEmpty}>
                    No hay otros pronósticos añadidos. Pulsa en &quot;➕ Añadir pronóstico&quot; para agregar cuotas o mercados adicionales.
                  </div>
                ) : (
                  <div className={styles.extraList}>
                    {form.extraPredictions.map((item, idx) => (
                      <div key={item.id} className={styles.extraCard}>
                        <div className={styles.extraCardHeader}>
                          <span className={styles.extraCardNum}>Pronóstico #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraPrediction(item.id)}
                            className={styles.btnRemoveExtra}
                            title="Eliminar este pronóstico"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                        <div className={styles.extraRow}>
                          <div className={styles.field}>
                            <label className={styles.label}>Apuesta</label>
                            <input
                              type="text"
                              value={item.bet}
                              onChange={(e) => handleExtraPredictionChange(item.id, 'bet', e.target.value)}
                              placeholder="Ej: Más de 2.5 goles, Ambos marcan..."
                              className={styles.input}
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.label}>Cuota</label>
                            <input
                              type="number"
                              step="0.01"
                              min="1.01"
                              value={item.odds}
                              onChange={(e) => handleExtraPredictionChange(item.id, 'odds', e.target.value)}
                              placeholder="Ej: 1.85"
                              className={styles.input}
                            />
                          </div>
                        </div>
                        <div className={styles.fieldFull}>
                          <label className={styles.label}>Análisis</label>
                          <textarea
                            value={item.analysis}
                            onChange={(e) => handleExtraPredictionChange(item.id, 'analysis', e.target.value)}
                            placeholder="Explica los motivos de este pronóstico secundario..."
                            className={styles.textarea}
                            rows={2}
                            style={{ minHeight: '60px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              {form.odds && form.stake && (
                <div className={styles.previewBox}>
                  <span className={styles.previewLabel}>Retorno potencial:</span>
                  <span className={styles.previewValue}>
                    {(parseFloat(form.odds || '0') * parseFloat(form.stake || '0')).toFixed(2)} u
                  </span>
                </div>
              )}

              <div className={styles.formActions}>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className={styles.btnCancel}>
                    Cancelar
                  </button>
                )}
                <button type="submit" className={styles.btnSubmit}>
                  {editingId ? '💾 Guardar cambios' : '🚀 Publicar pronóstico'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── PICKS LIST ── */}
        {activeTab === 'list' && (
          <div className={styles.card}>
            <div className={styles.listHeaderRow}>
              <h2 className={styles.listHeaderTitle}>Pronósticos publicados</h2>
              <div className={styles.listHeaderActions}>
                <button
                  type="button"
                  className={`${styles.btnShowAll} ${showAllDates ? styles.btnShowAllActive : ''}`}
                  onClick={() => setShowAllDates((prev) => !prev)}
                  title={showAllDates ? 'Filtrar por fecha' : 'Ver todos los pronósticos'}
                >
                  {showAllDates ? '📅 Filtrar por fecha' : '🌐 Ver todos'}
                </button>
                <DatePill
                  currentDate={adminDate}
                  onDateChange={(d) => {
                    setAdminDate(d);
                    setShowAllDates(false);
                  }}
                />
              </div>
            </div>

            {displayedPicks.length === 0 ? (
              <div className={styles.emptyList}>
                <p>
                  {showAllDates
                    ? 'No hay picks publicados todavía.'
                    : `No hay pronósticos publicados para el ${adminDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}.`}
                </p>
                {!showAllDates && picks.length > 0 && (
                  <button
                    type="button"
                    className={styles.btnSubmit}
                    onClick={() => setShowAllDates(true)}
                    style={{ marginTop: '8px' }}
                  >
                    🌐 Ver todos los picks ({picks.length})
                  </button>
                )}
                {picks.length === 0 && (
                  <button className={styles.btnSubmit} onClick={() => setActiveTab('add')}>
                    ➕ Crear el primer pick
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.pickTable}>
                <div className={styles.tableHeader}>
                  <span>Partido</span>
                  <span>Selección</span>
                  <span>Cuota</span>
                  <span>Probabilidad</span>
                  <span>Resultado</span>
                  <span>Acciones</span>
                </div>
                {displayedPicks.map((pick) => (
                  <div key={pick.id} className={styles.tableRow}>
                    <div className={styles.tableCell}>
                      <span className={styles.matchSport}>{pick.match?.sport.name}</span>
                      <span className={styles.matchTeams}>
                        {pick.match?.homeTeam.name} vs {pick.match?.awayTeam.name}
                      </span>
                      <span className={styles.matchDate}>
                        {pick.match?.startTime
                          ? new Date(pick.match.startTime).toLocaleDateString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })
                          : '—'}
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.selection}>{pick.selection}</span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.oddsValue}>{pick.odds}</span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.oddsValue} style={{ color: 'hsl(198 100% 65%)' }}>
                        {pick.probability
                          ? (String(pick.probability).endsWith('%') ? pick.probability : `${pick.probability}%`)
                          : (pick.odds ? `${Math.round(100 / pick.odds)}%` : '—')}
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <div className={styles.resultBtns}>
                        <button
                          className={`${styles.resultBtn} ${styles.resultBtnPending} ${pick.result === 'pending' ? styles.resultBtnActive : ''}`}
                          onClick={() => handleUpdateResult(pick.id, 'pending')}
                          title="Marcar como Pendiente"
                        >
                          ⏳
                        </button>
                        <button
                          className={`${styles.resultBtn} ${styles.resultBtnWin} ${pick.result === 'win' ? styles.resultBtnActive : ''}`}
                          onClick={() => handleUpdateResult(pick.id, 'win')}
                          title="Marcar como Ganado"
                        >
                          ✅
                        </button>
                        <button
                          className={`${styles.resultBtn} ${styles.resultBtnLoss} ${pick.result === 'loss' ? styles.resultBtnActive : ''}`}
                          onClick={() => handleUpdateResult(pick.id, 'loss')}
                          title="Marcar como Fallado"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                    <div className={styles.tableCell}>
                      <button onClick={() => handleEdit(pick)} className={styles.actionEdit}>✏️</button>
                      <button onClick={() => handleDelete(pick.id)} className={styles.actionDelete}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT RETO FORM ── */}
        {activeTab === 'add-reto' && (
          <div className={styles.card}>
            <div className={styles.formHeader}>
              <div className={styles.formHeaderTop}>
                <span className={styles.formHeaderIcon} style={{ background: 'hsl(198 100% 45%)', borderColor: 'hsl(198 100% 55% / 0.4)' }}>
                  🎯
                </span>
                <div>
                  <h2 className={styles.formHeaderTitle}>
                    {editingRetoId ? 'Editar Reto Deportivo' : 'Crear Nuevo Reto'}
                  </h2>
                  <p className={styles.formHeaderSubtitle}>
                    {editingRetoId
                      ? 'Modifica los parámetros, progreso o estado del reto'
                      : 'Define un nuevo reto exclusivo con objetivos, progreso y gestión de bankroll'}
                  </p>
                </div>

                {/* Interruptor "Telegram?": cambia el botón del reto en /retos */}
                <div className={styles.telegramToggleWrap}>
                  <label className={styles.telegramToggle} htmlFor="retoTelegramMode">
                    <span className={styles.telegramToggleLabel}>Telegram?</span>
                    <input
                      id="retoTelegramMode"
                      type="checkbox"
                      role="switch"
                      className={styles.telegramToggleInput}
                      checked={retoForm.telegramMode}
                      onChange={(e) =>
                        setRetoForm({ ...retoForm, telegramMode: e.target.checked })
                      }
                    />
                    <span
                      className={`${styles.telegramSwitch} ${
                        retoForm.telegramMode ? styles.telegramSwitchOn : ''
                      }`}
                      aria-hidden="true"
                    >
                      <span className={styles.telegramSwitchKnob} />
                    </span>
                    <span
                      className={`${styles.telegramToggleState} ${
                        retoForm.telegramMode ? styles.telegramToggleStateOn : ''
                      }`}
                    >
                      {retoForm.telegramMode ? 'ON' : 'OFF'}
                    </span>
                  </label>
                  <p className={styles.telegramToggleHint}>
                    {retoForm.telegramMode
                      ? 'En /retos el botón dirá «Sigue el reto en Telegram» y no se abrirá el modal.'
                      : 'En /retos el botón dirá «Saber Más del Reto» y se abrirá el modal.'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRetoSubmit} className={styles.form}>
              {/* Foto de portada del reto */}
              <div className={styles.coverField}>
                <div className={styles.coverHeader}>
                  <label className={styles.label}>Foto de portada</label>
                  {retoForm.coverImage && (
                    <button
                      type="button"
                      onClick={() => setRetoCoverImage('')}
                      className={styles.btnRemoveCover}
                    >
                      Quitar portada
                    </button>
                  )}
                </div>

                <label
                  className={`${styles.coverUploadLabel} ${draggingField === 'retoCover' ? styles.coverUploadDragging : ''}`}
                  htmlFor="retoCoverImage"
                  onDragOver={handleDragOver('retoCover')}
                  onDragEnter={handleDragOver('retoCover')}
                  onDragLeave={handleDragLeave}
                  onDrop={handleRetoCoverDrop}
                  title="Arrastra una imagen o una URL aquí, o haz clic para subir la portada"
                >
                  {retoForm.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={retoForm.coverImage}
                      alt="Portada del reto"
                      className={styles.coverPreview}
                    />
                  ) : (
                    <span className={styles.coverPlaceholder}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                      <span className={styles.coverPlaceholderText}>
                        {draggingField === 'retoCover'
                          ? 'Suelta la imagen aquí'
                          : 'Arrastra o haz clic para subir la portada'}
                      </span>
                    </span>
                  )}
                  <input
                    id="retoCoverImage"
                    type="file"
                    accept="image/*"
                    className={styles.coverInput}
                    onChange={handleRetoCoverUpload}
                  />
                </label>

                <input
                  type="url"
                  placeholder="...o pega aquí la URL de la imagen (https://...)"
                  value={retoForm.coverImage.startsWith('data:') ? '' : retoForm.coverImage}
                  onChange={(e) => setRetoCoverImage(e.target.value)}
                  className={styles.input}
                />
              </div>
              {/* Row 1: Title & Category */}
              <div className={styles.formRow}>
                <div className={styles.field} style={{ flex: 2 }}>
                  <label className={styles.label}>Título del Reto *</label>
                  <input
                    type="text"
                    placeholder="Ej: Reto Escalera: 10€ ➔ 500€"
                    value={retoForm.title}
                    onChange={(e) => setRetoForm({ ...retoForm, title: e.target.value })}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Categoría *</label>
                  <select
                    value={retoForm.category}
                    onChange={(e) => setRetoForm({ ...retoForm, category: e.target.value })}
                    className={styles.select}
                    required
                  >
                    {RETO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Estado */}
              <div className={styles.field}>
                <label className={styles.label}>Estado</label>
                <select
                  value={retoForm.badge}
                  onChange={(e) => {
                    const val = e.target.value;
                    const badgeType: RetoBadgeType =
                      val === 'Ganado' ? 'new' : val === 'Fallado' ? 'special' : 'active';
                    setRetoForm({ ...retoForm, badge: val, badgeType });
                  }}
                  className={styles.select}
                >
                  <option value="Pendiente">⏳ Pendiente</option>
                  <option value="Ganado">✅ Ganado</option>
                  <option value="Fallado">❌ Fallado</option>
                </select>
              </div>

              {/* Row 3: Description */}
              <div className={styles.field}>
                <label className={styles.label}>Descripción del Reto</label>
                <textarea
                  placeholder="Explica la estrategia del reto, normas y pasos a seguir..."
                  value={retoForm.desc}
                  onChange={(e) => setRetoForm({ ...retoForm, desc: e.target.value })}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              {/* Número de pasos / Dinero inicial / Objetivo */}
              <div className={styles.formRow3}>
                <div className={styles.field}>
                  <label className={styles.label}>Número de pasos del reto</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={retoForm.totalSteps}
                    onChange={(e) => handleRetoStepsCountChange(e.target.value)}
                    className={styles.input}
                    style={{ textAlign: 'center' }}
                  />
                  <span className={styles.fieldHint}>
                    Se generan {retoForm.totalSteps} {retoForm.totalSteps === 1 ? 'tarjeta' : 'tarjetas'} de paso abajo
                  </span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Dinero con el que empezamos</label>
                  <input
                    type="text"
                    placeholder="Ej: 10€, 50€, 100€"
                    value={retoForm.startingAmount}
                    onChange={(e) => setRetoForm({ ...retoForm, startingAmount: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Objetivo del reto</label>
                  <input
                    type="text"
                    placeholder="Ej: 500€, x50, Cuota 100"
                    value={retoForm.objective}
                    onChange={(e) => setRetoForm({ ...retoForm, objective: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              

{/* ── Pasos del reto (uno por cada pick del reto) ────────────────── */}
              <div className={styles.retosStepsSection}>
                <div className={styles.retosStepsHeader}>
                  <div>
                    <span className={styles.retosStepsTitle}>
                      🎯 Pasos del Reto ({retoForm.totalSteps})
                    </span>
                    <span className={styles.retosStepsSubtitle}>
                      Cada paso se muestra como un pick: logotipo, nombre de cada equipo y descripción.
                    </span>
                  </div>
                </div>

                {retoForm.steps.length === 0 ? (
                  <div className={styles.extraEmpty}>
                    Indica un número de pasos mayor que 0 para crear las tarjetas de cada paso.
                  </div>
                ) : (
                  <div className={styles.extraList}>
                    {retoForm.steps.map((step, index) => {
                      const homeDragKey: DragKey = `step:${step.id}:homeLogo`;
                      const awayDragKey: DragKey = `step:${step.id}:awayLogo`;
                      return (
                        <div key={step.id} className={styles.retoStepCard}>
                          <div className={styles.extraCardHeader}>
                            <span className={styles.extraCardNum}>
                              Paso {index + 1} / {retoForm.totalSteps}
                            </span>
                          </div>

                          {/* Logo + nombre local · VS · Logo + nombre visitante */}
                          <div className={styles.stepMatchRow}>
                            <div className={styles.teamBlock}>
                              <span className={styles.logoLabel}>Logo local</span>
                              <label
                                className={`${styles.logoUploadLabel} ${draggingField === homeDragKey ? styles.logoUploadDragging : ''}`}
                                onDragOver={handleDragOver(homeDragKey)}
                                onDragEnter={handleDragOver(homeDragKey)}
                                onDragLeave={handleDragLeave}
                                onDrop={handleRetoStepDrop(step.id, 'homeLogo')}
                                title="Arrastra una imagen/URL aquí o haz clic para subir"
                              >
                                {step.homeLogo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={step.homeLogo}
                                    alt={step.homeTeam || 'Equipo local'}
                                    className={styles.logoPreview}
                                  />
                                ) : (
                                  <span className={styles.logoPlaceholder}>
                                                                        <span style={{ fontSize: '18px' }}>🖼️</span>
                                    {draggingField === homeDragKey ? 'Suelta' : 'Subir'}
                                  </span>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className={styles.logoInput}
                                  onChange={handleRetoStepLogoUpload(step.id, 'homeLogo')}
                                />
                              </label>
                              <input
                                type="text"
                                placeholder="Equipo local"
                                value={step.homeTeam}
                                onChange={(e) => handleRetoStepChange(step.id, 'homeTeam', e.target.value)}
                                className={styles.input}
                              />
                            </div>

                            <span className={styles.stepVs}>VS</span>

                            <div className={styles.teamBlock}>
                              <span className={styles.logoLabel}>Logo visitante</span>
                              <label
                                className={`${styles.logoUploadLabel} ${draggingField === awayDragKey ? styles.logoUploadDragging : ''}`}
                                onDragOver={handleDragOver(awayDragKey)}
                                onDragEnter={handleDragOver(awayDragKey)}
                                onDragLeave={handleDragLeave}
                                onDrop={handleRetoStepDrop(step.id, 'awayLogo')}
                                title="Arrastra una imagen/URL aquí o haz clic para subir"
                              >
                                {step.awayLogo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={step.awayLogo}
                                    alt={step.awayTeam || 'Equipo visitante'}
                                    className={styles.logoPreview}
                                  />
                                ) : (
                                  <span className={styles.logoPlaceholder}>
                                    <span style={{ fontSize: '18px' }}>🖼️</span>
                                    {draggingField === awayDragKey ? 'Suelta' : 'Subir'}
                                  </span>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className={styles.logoInput}
                                  onChange={handleRetoStepLogoUpload(step.id, 'awayLogo')}
                                />
                              </label>
                              <input
                                type="text"
                                placeholder="Equipo visitante"
                                value={step.awayTeam}
                                onChange={(e) => handleRetoStepChange(step.id, 'awayTeam', e.target.value)}
                                className={styles.input}
                              />
                            </div>
                          </div>

                          {/* Fecha y hora del paso */}
                          <div className={styles.field}>
                            <label className={styles.label}>Fecha y hora del partido</label>
                            <input
                              type="datetime-local"
                              value={step.startTime}
                              onChange={(e) => handleRetoStepChange(step.id, 'startTime', e.target.value)}
                              className={styles.input}
                            />
                          </div>

                          {/* Apuesta y cuota del paso */}
                          <div className={styles.stepBetRow}>
                            <div className={styles.field}>
                              <label className={styles.label}>Nombre de la apuesta</label>
                              <input
                                type="text"
                                placeholder="Ej: Real Madrid o Empate y +1.5 goles"
                                value={step.bet}
                                onChange={(e) => handleRetoStepChange(step.id, 'bet', e.target.value)}
                                className={styles.input}
                              />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>Cuota</label>
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                placeholder="Ej: 1.65"
                                value={step.odds}
                                onChange={(e) => handleRetoStepChange(step.id, 'odds', e.target.value)}
                                className={styles.input}
                              />
                            </div>
                          </div>

                          {/* Estado del paso: ganado / perdido / pendiente */}
                          <div className={styles.stepResultRow}>
                            <span className={styles.stepResultLabel}>Estado del paso</span>
                            <div className={styles.stepResultBtns}>
                              {RETO_STEP_RESULTS.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleRetoStepResultChange(step.id, option.value)}
                                  className={`${styles.stepResultBtn} ${
                                    styles[`stepResult_${option.value}`]
                                  } ${step.result === option.value ? styles.stepResultBtnActive : ''}`}
                                  aria-pressed={step.result === option.value}
                                >
                                  <span className={styles.stepResultIcon}>{option.icon}</span>
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={styles.field}>
                            <label className={styles.label}>Descripción del paso {index + 1}</label>
                            <textarea
                              placeholder="Ej: Gana el Real Madrid con hándicap -1.5 a cuota 1.65. Análisis: presión alta y llegadas por banda..."
                              value={step.desc}
                              onChange={(e) => handleRetoStepChange(step.id, 'desc', e.target.value)}
                              className={styles.textarea}
                              rows={2}
                            />
                          </div>

                          {/* Dinero del paso: inicial y final tras la apuesta */}
                          <div className={styles.stepMoneyRow}>
                            <div className={styles.field}>
                              <label className={styles.label}>Dinero inicial del paso</label>
                              <input
                                type="text"
                                placeholder="Ej: 10€"
                                value={step.startAmount}
                                onChange={(e) =>
                                  handleRetoStepMoneyChange(step.id, 'startAmount', e.target.value)
                                }
                                className={styles.input}
                              />
                            </div>
                            <span className={styles.stepMoneyArrow}>➔</span>
                            <div className={styles.field}>
                              <label className={styles.label}>Dinero al acabar la apuesta</label>
                              <input
                                type="text"
                                placeholder="Ej: 16.50€"
                                value={step.endAmount}
                                onChange={(e) =>
                                  handleRetoStepMoneyChange(step.id, 'endAmount', e.target.value)
                                }
                                className={styles.input}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Row 6: Telegram Link */}
              <div className={styles.field}>
                <label className={styles.label}>Enlace de Telegram específico (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: https://t.me/rogipicks (dejar vacío para usar el canal por defecto)"
                  value={retoForm.telegramUrl}
                  onChange={(e) => setRetoForm({ ...retoForm, telegramUrl: e.target.value })}
                  className={styles.input}
                />
              </div>

              {/* Action buttons */}
              <div className={styles.actionsRow} style={{ marginTop: '24px' }}>
                {editingRetoId && (
                  <button type="button" onClick={handleCancelRetoEdit} className={styles.btnCancel}>
                    Cancelar Edición
                  </button>
                )}
                <button type="submit" className={styles.btnSubmit}>
                  {editingRetoId ? '💾 Guardar Cambios del Reto' : '🚀 Publicar Reto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── RETOS PUBLICADOS LIST ── */}
        {activeTab === 'list-retos' && (
          <div className={styles.card}>
            <div className={styles.listHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 className={styles.cardTitle} style={{ margin: 0, padding: 0, border: 'none' }}>
                  Retos Publicados ({retos.length})
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Gestiona el progreso, edita o elimina los retos que se muestran a los usuarios en la web.
                </p>
              </div>
              <button
                className={styles.btnSubmit}
                onClick={() => {
                  setEditingRetoId(null);
                  setRetoForm(emptyRetoForm());
                  setActiveTab('add-reto');
                }}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                ➕ Crear Nuevo Reto
              </button>
            </div>

            {retos.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏆</div>
                <p className={styles.emptyText}>No hay retos publicados actualmente.</p>
                <button
                  className={styles.btnSubmit}
                  onClick={() => {
                    setEditingRetoId(null);
                    setRetoForm(emptyRetoForm());
                    setActiveTab('add-reto');
                  }}
                >
                  ➕ Crear el primer reto
                </button>
              </div>
            ) : (
              <div className={styles.retosGrid} style={{ marginTop: '20px' }}>
                {retos.map((reto) => (
                  <div key={reto.id} className={styles.retoCard}>
                    <div className={styles.retoCardHeader}>
                      <div className={styles.retoBadges}>
                        <span className={styles.retoCategory}>{reto.category}</span>
                        <span className={`${styles.badge} ${styles[`badge_${reto.badgeType}`] || styles.badge_active}`}>
                          {reto.badge}
                        </span>
                      </div>
                      <div className={styles.retoActions}>
                        <button
                          onClick={() => handleEditReto(reto)}
                          className={styles.actionEdit}
                          title="Editar reto"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteReto(reto.id)}
                          className={styles.actionDelete}
                          title="Eliminar reto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <h3 className={styles.retoTitle}>{reto.title}</h3>
                    <p className={styles.retoDesc}>{reto.desc}</p>

                    <div className={styles.retoProgressContainer}>
                      <div className={styles.retoProgressLabels}>
                        <span className={styles.retoStepText}>{reto.currentStep}</span>
                        <span className={styles.retoProgressPct}>{reto.progress}%</span>
                      </div>
                      <div className={styles.retoProgressBar}>
                        <div
                          className={styles.retoProgressFill}
                          style={{ width: `${Math.min(100, Math.max(0, reto.progress))}%` }}
                        />
                      </div>
                    </div>

                    <div className={styles.retoMetaRow}>
                      <div>
                        <span className={styles.retoMetaLabel}>Stake / Inicio</span>
                        <span className={styles.retoMetaValue}>{reto.stake}</span>
                      </div>
                      <div>
                        <span className={styles.retoMetaLabel}>Estado actual</span>
                        <span className={styles.retoMetaHighlight}>{reto.currentBank}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
