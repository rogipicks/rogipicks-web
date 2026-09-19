'use client';

import { useState, useEffect } from 'react';
import type { Pick, PickResult, PickConfidence } from '@/types/pick';
import styles from './admin.module.css';

const ADMIN_PASSWORD = '1234';
const STORAGE_KEY = 'rogipicks_admin_picks';

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

function getStoredPicks(): Pick[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePicksToStorage(picks: Pick[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
}

type ExtraPredictionFormItem = {
  id: string;
  bet: string;
  odds: string;
  analysis: string;
};

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
  analysis: string;
  extraPredictions: ExtraPredictionFormItem[];
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
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<'homeLogo' | 'awayLogo' | null>(null);

  // Shortcut to current sport's form
  const form = forms[activeSport];

  const fetchAdminPicks = async () => {
    try {
      const res = await fetch('/api/picks');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPicks(json.data);
          savePicksToStorage(json.data);
          return;
        }
      }
    } catch {
      // fallback
    }
    setPicks(getStoredPicks());
  };

  useEffect(() => {
    if (isAuth) {
      fetchAdminPicks();
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

  const processImageFile = (file: File, field: 'homeLogo' | 'awayLogo') => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForms((prev) => ({
        ...prev,
        [activeSport]: { ...prev[activeSport], [field]: dataUrl },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Logo upload helper
  const handleLogoUpload = (field: 'homeLogo' | 'awayLogo') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processImageFile(file, field);
    };

  // Drag & drop handlers
  const handleDragOver = (field: 'homeLogo' | 'awayLogo') => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingField !== field) {
      setDraggingField(field);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingField(null);
  };

  const handleDrop = (field: 'homeLogo' | 'awayLogo') => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingField(null);

    // 1. Files dropped directly
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file, field);
      return;
    }

    // 2. URL dropped from web/browser
    const textUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (textUrl && (textUrl.startsWith('http://') || textUrl.startsWith('https://') || textUrl.startsWith('data:image/'))) {
      setForms((prev) => ({
        ...prev,
        [activeSport]: { ...prev[activeSport], [field]: textUrl },
      }));
    }
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
      const partial = {
        match: {
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

      const updated = picks.map((p) => {
        if (p.id !== editingId) return p;
        return {
          ...p,
          ...partial,
          updatedAt: new Date().toISOString(),
        };
      });
      setPicks(updated);
      savePicksToStorage(updated);
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
      savePicksToStorage(updated);
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
    try {
      await fetch(`/api/picks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting pick:', err);
    }
    const updated = picks.filter((p) => p.id !== id);
    setPicks(updated);
    savePicksToStorage(updated);
    setSuccessMsg('🗑️ Pick eliminado');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateResult = async (id: string, result: PickResult) => {
    try {
      await fetch(`/api/picks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
    } catch (err) {
      console.error('Error updating result:', err);
    }
    const updated = picks.map((p) =>
      p.id === id ? { ...p, result, updatedAt: new Date().toISOString() } : p
    );
    setPicks(updated);
    savePicksToStorage(updated);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForms((prev) => ({ ...prev, [activeSport]: emptyFormForSport() }));
    setActiveTab('list');
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
            <span className={styles.pickCount}>{picks.length} picks publicados</span>
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
            <h2 className={styles.cardTitle}>Pronósticos publicados</h2>
            {picks.length === 0 ? (
              <div className={styles.emptyList}>
                <p>No hay picks publicados todavía.</p>
                <button className={styles.btnSubmit} onClick={() => setActiveTab('add')}>
                  ➕ Crear el primer pick
                </button>
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
                {picks.map((pick) => (
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
      </main>
    </div>
  );
}
