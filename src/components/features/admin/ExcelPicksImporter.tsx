'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import type { Pick, PickConfidence, PodiumPosition } from '@/types/pick';
import styles from './ExcelPicksImporter.module.css';

export interface ParsedPickDraft {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeLabel?: string;
  awayLabel?: string;
  homeType?: 'flag' | 'kit' | 'badge';
  awayType?: 'flag' | 'kit' | 'badge';
  isResolvingLogos?: boolean;
  competition: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  selection: string;
  odds: string;
  probability: string;
  confidence: number;
  sport: string;      // football | basketball | tennis | darts
  analysis: string;
  isGeneratingAi?: boolean;
}

interface ExcelPicksImporterProps {
  onPicksImported: (newPicks: Pick[]) => void;
  onCancel?: () => void;
}

const SPORTS_MAP: Record<string, { id: string; name: string }> = {
  football: { id: 's-football', name: 'Fútbol' },
  basketball: { id: 's-basketball', name: 'Baloncesto' },
  tennis: { id: 's-tennis', name: 'Tenis' },
  darts: { id: 's-darts', name: 'Dardos' },
};

function autoDetectSport(comp: string, selection: string): string {
  const c = comp.toLowerCase();
  const s = selection.toLowerCase();

  if (
    c.includes('atp') || c.includes('wta') || c.includes('challenger') ||
    c.includes('itf') || c.includes('open') || c.includes('roland') ||
    c.includes('wimbledon') || c.includes('slam') || c.includes('davis') ||
    c.includes('plovdiv') || c.includes('utr') ||
    /\bch\s*\d+/i.test(comp) || /\bm\d{2}/i.test(comp) || /\bw\d{2}/i.test(comp) ||
    s.includes('set') || s.includes('juego') || s.includes('games') || s.includes('tiebreak')
  ) {
    return 'tennis';
  }

  if (
    c.includes('nba') || c.includes('acb') || c.includes('basket') ||
    c.includes('euroliga') || c.includes('euroleague') || c.includes('fiba') ||
    s.includes('puntos') || s.includes('rebotes')
  ) {
    return 'basketball';
  }

  if (c.includes('dart') || c.includes('pdc') || s.includes('180s')) {
    return 'darts';
  }

  return 'football';
}

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Limpia y normaliza fecha a formato YYYY-MM-DD */
function parseExcelDate(val: any): string {
  if (!val) {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  // Si ya es un objeto Date
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Si es un número serial de Excel (ej: 46289 o 46307.125)
  if (typeof val === 'number') {
    const daySerial = Math.floor(val);
    // Sumar medio día (0.5) para evitar cualquier desvío por huso horario
    const date = new Date(Math.round((daySerial - 25569 + 0.5) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(val).trim();

  // Formato YYYY-MM-DD (con posible hora o zona horaria detrás)
  const ymMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymMatch) {
    const y = ymMatch[1];
    const m = ymMatch[2].padStart(2, '0');
    const d = ymMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Formato DD/MM/YYYY o DD/MM/YY (o DD-MM-YYYY, DD.MM.YYYY)
  const dmMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (dmMatch) {
    const n1 = parseInt(dmMatch[1], 10);
    const n2 = parseInt(dmMatch[2], 10);
    const rawY = dmMatch[3];
    const y = rawY.length === 2 ? `20${rawY}` : rawY;

    let day = n1;
    let month = n2;

    // Si n1 <= 12 y n2 > 12, el formato origen era MM/DD/YYYY
    if (n1 <= 12 && n2 > 12) {
      month = n1;
      day = n2;
    }

    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/** Limpia y normaliza hora a formato HH:MM */
function parseExcelTime(val: any): string {
  if (!val) return '12:00';

  if (val instanceof Date && !isNaN(val.getTime())) {
    const h = String(val.getHours()).padStart(2, '0');
    const m = String(val.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // Si es un número serial de Excel (ej: 0.36111 para 08:40 o 46307.125 para 03:00)
  if (typeof val === 'number') {
    const timeFrac = val % 1;
    if (timeFrac > 0) {
      const totalMinutes = Math.round(timeFrac * 24 * 60);
      const hours = Math.floor(totalMinutes / 60) % 24;
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  const str = String(val).trim();
  const timeMatch = str.match(/(\d{1,2})[:\.](\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }

  return '12:00';
}

export function ExcelPicksImporter({ onPicksImported, onCancel }: ExcelPicksImporterProps) {
  const [drafts, setDrafts] = useState<ParsedPickDraft[]>([]);
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isBulkResolvingLogos, setIsBulkResolvingLogos] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Carga claves almacenadas previamente en local si existen
  useEffect(() => {
    const savedGroq = localStorage.getItem('rogipicks_groq_key') || localStorage.getItem('rogipicks_grok_key');
    if (savedGroq) setGroqKey(savedGroq);
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGroqKey(val);
    localStorage.setItem('rogipicks_groq_key', val);
  };

  /** Resuelve banderas de países para todos los partidos (fútbol, tenis, etc.) */
  const resolveLogosForDrafts = async (draftList?: ParsedPickDraft[]) => {
    const targets = draftList && draftList.length > 0 ? draftList : drafts;
    if (!targets || targets.length === 0) return;

    setIsBulkResolvingLogos(true);

    const targetIds = new Set(targets.map((t) => t.id));
    setDrafts((prev) =>
      prev.map((d) => (targetIds.has(d.id) ? { ...d, isResolvingLogos: true } : d))
    );

    try {
      const itemsPayload = targets.map((d) => ({
        id: d.id,
        homeTeam: d.homeTeam,
        awayTeam: d.awayTeam,
        sport: d.sport,
        competition: d.competition,
      }));

      const res = await fetch('/api/ai/resolve-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          apiKey: groqKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          const resultsMap = new Map(data.results.map((r: any) => [r.id, r]));

          setDrafts((prev) =>
            prev.map((d) => {
              const resObj: any = resultsMap.get(d.id);
              if (!resObj) return { ...d, isResolvingLogos: false };
              return {
                ...d,
                homeLogo: resObj.homeLogo || d.homeLogo || 'https://flagcdn.com/w160/es.png',
                awayLogo: resObj.awayLogo || d.awayLogo || 'https://flagcdn.com/w160/es.png',
                homeLabel: resObj.homeLabel || d.homeLabel || 'España',
                awayLabel: resObj.awayLabel || d.awayLabel || 'España',
                homeType: 'flag' as const,
                awayType: 'flag' as const,
                isResolvingLogos: false,
              };
            })
          );
          setIsBulkResolvingLogos(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error al resolver banderas:', err);
    }

    setDrafts((prev) =>
      prev.map((d) => (targetIds.has(d.id) ? { ...d, isResolvingLogos: false } : d))
    );
    setIsBulkResolvingLogos(false);
  };

  /** Descarga una plantilla de Excel lista con las columnas solicitadas */
  const handleDownloadTemplate = () => {
    const headers = [
      ['NOMBRE LOCAL', 'NOMBRE VISITANTE', 'COMPETICIÓN', 'FECHA', 'HORA', 'APUESTA', 'CUOTA', 'PROBABILIDAD', 'CONFIANZA'],
      ['Shang Juncheng', 'Adrian Mannarino', 'ATP Chengdu', '12/10/2026', '08:40', 'Shang Hándicap (-1.5)', '1.47', '90%', '5'],
      ['Real Madrid', 'Barcelona', 'LaLiga EA Sports', '12/10/2026', '21:00', 'Más de 2.5 goles', '1.80', '85%', '4'],
      ['Los Angeles Lakers', 'Boston Celtics', 'NBA', '12/10/2026', '02:30', 'Lakers +4.5 Hándicap', '1.91', '75%', '4'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Picks');
    XLSX.writeFile(wb, 'plantilla-picks-rogipicks.xlsx');
  };

  /** Mapea las filas crudas de Excel a drafts listos para el sistema */
  const processRawRows = (rows: Record<string, any>[]) => {
    setErrorMsg('');
    if (!rows || rows.length === 0) {
      setErrorMsg('El archivo o texto no contiene filas de datos.');
      return;
    }

    const newDrafts: ParsedPickDraft[] = [];

    rows.forEach((raw, idx) => {
      // Normalizar claves del objeto
      const row: Record<string, any> = {};
      Object.keys(raw).forEach((k) => {
        row[normalizeHeader(k)] = raw[k];
      });

      const homeTeam = String(
        row['NOMBRE LOCAL'] || row['LOCAL'] || row['EQUIPO LOCAL'] || row['JUGADOR LOCAL'] || row['HOME'] || ''
      ).trim();

      const awayTeam = String(
        row['NOMBRE VISITANTE'] || row['VISITANTE'] || row['EQUIPO VISITANTE'] || row['JUGADOR VISITANTE'] || row['AWAY'] || ''
      ).trim();

      // Si no hay local ni visitante, saltar fila vacía
      if (!homeTeam && !awayTeam) return;

      const competition = String(
        row['COMPETICION'] || row['COMPETICIÓN'] || row['TORNEO'] || row['LIGA'] || ''
      ).trim();

      const rawDate = row['FECHA'] || row['DATE'] || '';
      const rawTime = row['HORA'] || row['TIME'] || '';
      const date = parseExcelDate(rawDate);
      const time = parseExcelTime(rawTime);

      const selection = String(
        row['APUESTA'] || row['PRONOSTICO'] || row['PRONÓSTICO'] || row['SELECCION'] || row['SELECCIÓN'] || ''
      ).trim() || 'Victoria';

      const rawOdds = String(row['CUOTA'] || row['ODDS'] || '1.80').replace(',', '.');
      const odds = isNaN(parseFloat(rawOdds)) ? '1.80' : parseFloat(rawOdds).toFixed(2);

      let rawProb = String(row['PROBABILIDAD'] || row['PROB'] || '').trim();
      if (rawProb && !rawProb.endsWith('%')) {
        const num = parseFloat(rawProb);
        if (!isNaN(num)) {
          rawProb = num <= 1 ? `${Math.round(num * 100)}%` : `${Math.round(num)}%`;
        }
      }
      const probability = rawProb || (odds ? `${Math.round(100 / parseFloat(odds))}%` : '80%');

      const rawConf = parseInt(String(row['CONFIANZA'] || row['STARS'] || '3'), 10);
      const confidence = isNaN(rawConf) || rawConf < 1 ? 3 : Math.min(5, rawConf);

      const sport = autoDetectSport(competition, selection);

      newDrafts.push({
        id: `draft-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        homeTeam: homeTeam || 'Local',
        awayTeam: awayTeam || 'Visitante',
        homeLogo: '',
        awayLogo: '',
        homeType: 'flag',
        awayType: 'flag',
        homeLabel: '',
        awayLabel: '',
        competition,
        date,
        time,
        selection,
        odds,
        probability,
        confidence,
        sport,
        analysis: '',
        isGeneratingAi: false,
        isResolvingLogos: true,
      });
    });

    if (newDrafts.length === 0) {
      setErrorMsg('No se detectaron filas válidas. Revisa que las columnas coincidan con la plantilla (NOMBRE LOCAL, NOMBRE VISITANTE, etc.).');
      return;
    }

    setDrafts((prev) => [...prev, ...newDrafts]);

    // Resuelve automáticamente banderas de los partidos con IA
    setTimeout(() => {
      resolveLogosForDrafts(newDrafts);
    }, 50);
  };

  /** Procesa archivo Excel o CSV */
  const handleFileUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', raw: true });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '', raw: true });
      processRawRows(jsonRows);
    } catch (err) {
      console.error('Error al leer el archivo Excel:', err);
      setErrorMsg('Error al leer el archivo Excel. Asegúrate de que sea un archivo válido (.xlsx o .csv).');
    }
  };

  /** Procesa texto pegado de Excel o Google Sheets */
  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    try {
      // SheetJS lee texto separado por tabulaciones (TSV) respetando strings crudos
      const wb = XLSX.read(pasteText, { type: 'string', raw: true });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '', raw: true });
      processRawRows(jsonRows);
      setPasteText('');
    } catch {
      setErrorMsg('No se pudo interpretar el texto pegado.');
    }
  };

  /** Genera el análisis de una fila individual con Grok / IA */
  const generateAnalysisForRow = async (draftId: string) => {
    const item = drafts.find((d) => d.id === draftId);
    if (!item) return;

    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, isGeneratingAi: true } : d))
    );

    try {
      const res = await fetch('/api/ai/analyze-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam: item.homeTeam,
          awayTeam: item.awayTeam,
          competition: item.competition,
          selection: item.selection,
          odds: item.odds,
          sport: item.sport,
          confidence: item.confidence,
          apiKey: groqKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          setDrafts((prev) =>
            prev.map((d) =>
              d.id === draftId ? { ...d, analysis: data.analysis, isGeneratingAi: false } : d
            )
          );
          return;
        }
      }
    } catch (err) {
      console.error('Error generando análisis con IA:', err);
    }

    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, isGeneratingAi: false } : d))
    );
  };

  /** Genera análisis de todas las filas en lote */
  const generateAllAnalyses = async () => {
    if (drafts.length === 0 || isBulkGenerating) return;

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: drafts.length });

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      setBulkProgress({ current: i + 1, total: drafts.length });

      // Si ya tiene análisis, no lo sobreescribimos salvo que esté vacío
      if (!draft.analysis) {
        await generateAnalysisForRow(draft.id);
      }
    }

    setIsBulkGenerating(false);
  };

  /** Publica todos los picks confirmados */
  const handlePublishAll = async () => {
    if (drafts.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const picksToCreate: Pick[] = drafts.map((d, index) => {
        const sportObj = SPORTS_MAP[d.sport] || SPORTS_MAP.football;
        const oddsNum = parseFloat(d.odds) || 1.8;
        const [y, m, dNum] = (d.date || '').split('-').map(Number);
        const [h, min] = (d.time || '12:00').split(':').map(Number);
        const safeDate = new Date(
          !isNaN(y) ? y : new Date().getFullYear(),
          !isNaN(m) ? m - 1 : new Date().getMonth(),
          !isNaN(dNum) ? dNum : new Date().getDate(),
          !isNaN(h) ? h : 12,
          !isNaN(min) ? min : 0
        );
        const startTimeIso = safeDate.toISOString();

        return {
          id: `pick-admin-${Date.now()}-${index}`,
          matchId: `m-${Date.now()}-${index}`,
          userId: 'u-admin',
          user: {
            id: 'u-admin',
            username: 'RogiPicks',
            email: 'admin@rogipicks.com',
            role: 'tipster',
            createdAt: new Date().toISOString(),
          },
          match: {
            id: `m-${Date.now()}-${index}`,
            sport: { id: sportObj.id, name: sportObj.name, category: d.sport as any },
            homeTeam: {
              id: `t-h-${Date.now()}-${index}`,
              name: d.homeTeam,
              shortName: d.homeTeam.slice(0, 3).toUpperCase(),
              sportId: sportObj.id,
              logoUrl: d.homeLogo || undefined,
            },
            awayTeam: {
              id: `t-a-${Date.now()}-${index}`,
              name: d.awayTeam,
              shortName: d.awayTeam.slice(0, 3).toUpperCase(),
              sportId: sportObj.id,
              logoUrl: d.awayLogo || undefined,
            },
            competition: d.competition || undefined,
            startTime: startTimeIso,
            status: 'scheduled',
            odds: { homeWin: oddsNum, awayWin: 2.0, updatedAt: new Date().toISOString() },
          },
          selection: d.selection,
          odds: oddsNum,
          stake: 1,
          potentialReturn: parseFloat((1 * oddsNum).toFixed(2)),
          confidence: confNum,
          probability: d.probability || undefined,
          podium: null,
          result: 'pending',
          analysis: d.analysis.trim() || undefined,
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(picksToCreate),
      });

      if (!res.ok) {
        throw new Error('Error al enviar los picks a la API');
      }

      onPicksImported(picksToCreate);
      setDrafts([]);
    } catch (err: any) {
      console.error('Error publicando picks en lote:', err);
      setErrorMsg(err.message || 'Error al publicar los picks. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDraftField = (id: string, field: keyof ParsedPickDraft, val: any) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: val } : d))
    );
  };

  return (
    <div className={styles.importerCard}>
      {/* Cabecera */}
      <div className={styles.header}>
        <div className={styles.headerTitleRow}>
          <span className={styles.headerIcon}>📊</span>
          <div>
            <h2 className={styles.title}>Importar Picks desde Excel con IA (Groq)</h2>
            <p className={styles.subtitle}>
              Carga tu tabla de apuestas y genera automáticamente el análisis técnico con inteligencia artificial.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className={styles.templateBtn}
          title="Descargar plantilla de Excel con el formato exacto"
        >
          📥 Descargar plantilla Excel (.xlsx)
        </button>
      </div>

      {/* Configuración de Groq */}
      <div className={styles.aiConfigBox}>
        <div className={styles.aiConfigHeader}>
          <span className={styles.aiIcon}>⚡</span>
          <span className={styles.aiTitle}>Inteligencia Artificial: Groq (Llama 3.3)</span>
          <span className={groqKey ? styles.aiBadgeActive : styles.aiBadgeIdle}>
            {groqKey ? '🟢 Groq Activo' : '⚪ Modelo deportivo integrado'}
          </span>
        </div>
        <div className={styles.aiKeyRow}>
          <input
            type="password"
            className={styles.aiKeyInput}
            placeholder="Clave API de Groq (gsk_...) — Opcional si ya la pusiste en .env.local"
            value={groqKey}
            onChange={handleKeyChange}
          />
          <span className={styles.aiKeyHelp}>
            Consíguela gratis en console.groq.com. O déjala vacía si está en .env.local o para usar el modelo integrado.
          </span>
        </div>
      </div>


      {/* Pestañas de modo de entrada: Subir archivo vs Pegar */}
      <div className={styles.modeTabs}>
        <button
          type="button"
          className={`${styles.modeTab} ${activeInputMode === 'upload' ? styles.modeTabActive : ''}`}
          onClick={() => setActiveInputMode('upload')}
        >
          📁 Subir archivo (.xlsx / .csv)
        </button>
        <button
          type="button"
          className={`${styles.modeTab} ${activeInputMode === 'paste' ? styles.modeTabActive : ''}`}
          onClick={() => setActiveInputMode('paste')}
        >
          📋 Pegar celdas copiadas de Excel
        </button>
      </div>

      {/* Zona de entrada */}
      {activeInputMode === 'upload' ? (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          <span className={styles.dropIcon}>📂</span>
          <p className={styles.dropText}>
            <strong>Haz clic para seleccionar tu archivo</strong> o arrástralo aquí
          </p>
          <span className={styles.dropFormat}>Formatos admitidos: .xlsx, .xls, .csv</span>
        </div>
      ) : (
        <div className={styles.pasteZone}>
          <textarea
            className={styles.pasteTextarea}
            placeholder="Copia las filas en Excel o Google Sheets (incluyendo la cabecera) y pégalas aquí..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
          />
          <button
            type="button"
            className={styles.pasteBtn}
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim()}
          >
            Procesar celdas pegadas
          </button>
        </div>
      )}

      {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

      {/* Tabla de previsualización y generación */}
      {drafts.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <div className={styles.previewCount}>
              <span className={styles.previewCountBadge}>{drafts.length}</span> picks listos para revisar
            </div>

            <div className={styles.previewActions}>
              <button
                type="button"
                className={styles.logosBulkBtn}
                onClick={() => resolveLogosForDrafts()}
                disabled={isBulkResolvingLogos || isSubmitting}
                title="Detectar automáticamente las banderas de cada partido"
              >
                {isBulkResolvingLogos ? (
                  <>⏳ Buscando banderas...</>
                ) : (
                  <>🏳️ Resolver Banderas</>
                )}
              </button>

              <button
                type="button"
                className={styles.aiBulkBtn}
                onClick={generateAllAnalyses}
                disabled={isBulkGenerating || isSubmitting}
              >
                {isBulkGenerating ? (
                  <>⏳ Generando {bulkProgress.current} de {bulkProgress.total} con Groq...</>
                ) : (
                  <>⚡ Generar TODOS los análisis con Groq</>
                )}
              </button>

              <button
                type="button"
                className={styles.publishAllBtn}
                onClick={handlePublishAll}
                disabled={isSubmitting || isBulkGenerating}
              >
                {isSubmitting ? 'Guardando en la web…' : `🚀 Publicar ${drafts.length} picks`}
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Partido (Local vs Visitante)</th>
                  <th>Competición</th>
                  <th>Fecha & Hora</th>
                  <th>Apuesta</th>
                  <th>Cuota</th>
                  <th>Prob / Conf</th>
                  <th>Deporte</th>
                  <th style={{ minWidth: '320px' }}>Análisis deportivo (Groq IA)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className={styles.teamFieldWrapper}>
                        <div className={styles.teamInputWithLogo}>
                          <div
                            className={styles.miniLogoBox}
                            title={d.homeLabel ? `Bandera: ${d.homeLabel}` : 'Bandera del equipo o país'}
                          >
                            {d.isResolvingLogos ? (
                              <span className={styles.miniSpinner}>⏳</span>
                            ) : d.homeLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={d.homeLogo}
                                alt={d.homeTeam}
                                className={`${styles.miniLogoImg} ${styles.miniLogoFlag}`}
                              />
                            ) : (
                              <span className={styles.miniPlaceholder}>
                                {d.sport === 'tennis' ? '🎾' : d.sport === 'basketball' ? '🏀' : '⚽'}
                              </span>
                            )}
                          </div>
                          <input
                            className={styles.cellInput}
                            value={d.homeTeam}
                            placeholder="Local"
                            onChange={(e) => updateDraftField(d.id, 'homeTeam', e.target.value)}
                          />
                        </div>

                        <span className={styles.vsBadge}>vs</span>

                        <div className={styles.teamInputWithLogo}>
                          <div
                            className={styles.miniLogoBox}
                            title={d.awayLabel ? `Bandera: ${d.awayLabel}` : 'Bandera del equipo o país'}
                          >
                            {d.isResolvingLogos ? (
                              <span className={styles.miniSpinner}>⏳</span>
                            ) : d.awayLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={d.awayLogo}
                                alt={d.awayTeam}
                                className={`${styles.miniLogoImg} ${styles.miniLogoFlag}`}
                              />
                            ) : (
                              <span className={styles.miniPlaceholder}>
                                {d.sport === 'tennis' ? '🎾' : d.sport === 'basketball' ? '🏀' : '⚽'}
                              </span>
                            )}
                          </div>
                          <input
                            className={styles.cellInput}
                            value={d.awayTeam}
                            placeholder="Visitante"
                            onChange={(e) => updateDraftField(d.id, 'awayTeam', e.target.value)}
                          />
                        </div>

                        {(d.homeLabel || d.awayLabel) && (
                          <span className={styles.logoInfoBadge}>
                            🏳️ {d.homeLabel || d.awayLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <input
                        className={styles.cellInput}
                        value={d.competition}
                        placeholder="Competición"
                        onChange={(e) => updateDraftField(d.id, 'competition', e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        className={styles.cellInputSmall}
                        value={d.date}
                        onChange={(e) => updateDraftField(d.id, 'date', e.target.value)}
                      />
                      <input
                        type="time"
                        className={styles.cellInputSmall}
                        value={d.time}
                        onChange={(e) => updateDraftField(d.id, 'time', e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        className={styles.cellInput}
                        value={d.selection}
                        placeholder="Pronóstico"
                        onChange={(e) => updateDraftField(d.id, 'selection', e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        className={styles.cellInputTiny}
                        value={d.odds}
                        placeholder="1.80"
                        onChange={(e) => updateDraftField(d.id, 'odds', e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        className={styles.cellInputTiny}
                        value={d.probability}
                        placeholder="85%"
                        onChange={(e) => updateDraftField(d.id, 'probability', e.target.value)}
                      />
                      <select
                        className={styles.cellSelect}
                        value={d.confidence}
                        onChange={(e) => updateDraftField(d.id, 'confidence', parseInt(e.target.value, 10))}
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <option key={s} value={s}>{s}★</option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select
                        className={styles.cellSelect}
                        value={d.sport}
                        onChange={(e) => {
                          const newSport = e.target.value;
                          const isTennis = newSport === 'tennis';
                          const updated = {
                            ...d,
                            sport: newSport,
                            homeLogo: '',
                            awayLogo: '',
                            homeLabel: '',
                            awayLabel: '',
                            homeType: 'flag' as const,
                            awayType: 'flag' as const,
                            isResolvingLogos: true,
                          };
                          setDrafts((prev) =>
                            prev.map((item) => (item.id === d.id ? updated : item))
                          );
                          resolveLogosForDrafts([updated]);
                        }}
                      >
                        <option value="football">⚽ Fútbol</option>
                        <option value="tennis">🎾 Tenis</option>
                        <option value="basketball">🏀 Basket</option>
                        <option value="darts">🎯 Dardos</option>
                      </select>
                    </td>

                    <td>
                      <div className={styles.analysisCol}>
                        <textarea
                          className={styles.analysisTextarea}
                          rows={5}
                          placeholder="El análisis se generará automáticamente con Groq..."
                          value={d.analysis}
                          onChange={(e) => updateDraftField(d.id, 'analysis', e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.aiRowBtn}
                          onClick={() => generateAnalysisForRow(d.id)}
                          disabled={d.isGeneratingAi}
                          title="Generar análisis para este pick con Groq"
                        >
                          {d.isGeneratingAi ? '⏳ Generando…' : '⚡ Groq IA'}
                        </button>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={styles.deleteRowBtn}
                        onClick={() => removeDraft(d.id)}
                        title="Eliminar de la lista"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
