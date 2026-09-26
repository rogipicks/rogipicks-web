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

  // Si es un número serial de Excel (ej: 46289)
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(val).trim();
  // Formato DD/MM/YYYY o DD-MM-YYYY o DD.MM.YYYY
  const dmMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmMatch) {
    const d = dmMatch[1].padStart(2, '0');
    const m = dmMatch[2].padStart(2, '0');
    const y = dmMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Formato YYYY-MM-DD
  const ymMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymMatch) {
    const y = ymMatch[1];
    const m = ymMatch[2].padStart(2, '0');
    const d = ymMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/** Limpia y normaliza hora a formato HH:MM */
function parseExcelTime(val: any): string {
  if (!val) return '12:00';

  // Si es un número fraccionario de Excel (ej: 0.36111 para las 08:40)
  if (typeof val === 'number' && val < 1) {
    const totalMinutes = Math.round(val * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
  const [geminiKey, setGeminiKey] = useState('');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isBulkResolvingLogos, setIsBulkResolvingLogos] = useState(false);
  const [isGeneratingKits, setIsGeneratingKits] = useState(false);
  const [kitsProgress, setKitsProgress] = useState({ current: 0, total: 0 });
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Carga claves almacenadas previamente en local si existen
  useEffect(() => {
    const savedGroq = localStorage.getItem('rogipicks_groq_key') || localStorage.getItem('rogipicks_grok_key');
    if (savedGroq) setGroqKey(savedGroq);

    const savedGemini = localStorage.getItem('rogipicks_gemini_key') || localStorage.getItem('rogipicks_google_key');
    if (savedGemini) setGeminiKey(savedGemini);
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGroqKey(val);
    localStorage.setItem('rogipicks_groq_key', val);
  };

  const handleGeminiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGeminiKey(val);
    localStorage.setItem('rogipicks_gemini_key', val);
  };

  /** Resuelve banderas de tenis y camisetas de fútbol/baloncesto con IA */
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
              const isTennis = d.sport === 'tennis';
              return {
                ...d,
                homeLogo: isTennis ? (resObj.homeLogo || 'https://flagcdn.com/w160/es.png') : (resObj.homeLogo || d.homeLogo || ''),
                awayLogo: isTennis ? (resObj.awayLogo || 'https://flagcdn.com/w160/es.png') : (resObj.awayLogo || d.awayLogo || ''),
                homeLabel: resObj.homeLabel || (isTennis ? 'España' : d.homeLabel),
                awayLabel: resObj.awayLabel || (isTennis ? 'España' : d.awayLabel),
                homeType: isTennis ? 'flag' : (resObj.homeType || d.homeType),
                awayType: isTennis ? 'flag' : (resObj.awayType || d.awayType),
                isResolvingLogos: false,
              };
            })
          );
          setIsBulkResolvingLogos(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error al resolver logos con IA:', err);
    }

    setDrafts((prev) =>
      prev.map((d) => (targetIds.has(d.id) ? { ...d, isResolvingLogos: false } : d))
    );
    setIsBulkResolvingLogos(false);
  };

  /**
   * Genera imágenes de camisetas con IA de Google Gemini para fútbol y basket.
   * Para tenis sigue usando banderas del resolver existente.
   */
  const generateKitsWithAI = async (draftList?: ParsedPickDraft[]) => {
    const targets = (draftList && draftList.length > 0 ? draftList : drafts).filter(
      (d) => d.sport !== 'tennis'
    );
    const tennisTargets = (draftList && draftList.length > 0 ? draftList : drafts).filter(
      (d) => d.sport === 'tennis'
    );

    // Para tenis: resolver banderas como siempre
    if (tennisTargets.length > 0) {
      resolveLogosForDrafts(tennisTargets);
    }

    if (targets.length === 0) return;

    setIsGeneratingKits(true);
    setKitsProgress({ current: 0, total: targets.length * 2 }); // x2 por home + away

    const targetIds = new Set(targets.map((t) => t.id));
    setDrafts((prev) =>
      prev.map((d) => (targetIds.has(d.id) ? { ...d, isResolvingLogos: true } : d))
    );

    let done = 0;
    const updates: Map<string, { homeLogo?: string; awayLogo?: string }> = new Map();

    // Genera imágenes en paralelo por equipo (máx 4 a la vez para no saturar)
    const teamTasks: Promise<void>[] = [];
    for (const draft of targets) {
      // Home team kit
      teamTasks.push(
        (async () => {
          try {
            const res = await fetch('/api/ai/generate-kit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                teamName: draft.homeTeam,
                sport: draft.sport,
                competition: draft.competition,
                apiKey: geminiKey,
              }),
            });
            const data = await res.json();
            if (data.success && data.imageUrl) {
              const url = data.imageUrl;
              const prev = updates.get(draft.id) || {};
              updates.set(draft.id, { ...prev, homeLogo: url });
              // Actualizar draft inmediatamente en la tabla
              setDrafts((prev) =>
                prev.map((d) =>
                  d.id === draft.id ? { ...d, homeLogo: url, homeType: 'kit' as const } : d
                )
              );
            } else if (data.error) {
              setErrorMsg(data.error);
            }
          } catch (e: any) {
            setErrorMsg(e.message || 'Error al conectar con la API de Gemini.');
          }
          done++;
          setKitsProgress((p) => ({ ...p, current: done }));
        })()
      );

      // Away team kit
      teamTasks.push(
        (async () => {
          try {
            const res = await fetch('/api/ai/generate-kit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                teamName: draft.awayTeam,
                sport: draft.sport,
                competition: draft.competition,
                apiKey: geminiKey,
              }),
            });
            const data = await res.json();
            if (data.success && data.imageUrl) {
              const url = data.imageUrl;
              const prev = updates.get(draft.id) || {};
              updates.set(draft.id, { ...prev, awayLogo: url });
              // Actualizar draft inmediatamente en la tabla
              setDrafts((prev) =>
                prev.map((d) =>
                  d.id === draft.id ? { ...d, awayLogo: url, awayType: 'kit' as const } : d
                )
              );
            } else if (data.error) {
              setErrorMsg(data.error);
            }
          } catch (e: any) {
            setErrorMsg(e.message || 'Error al conectar con la API de Gemini.');
          }
          done++;
          setKitsProgress((p) => ({ ...p, current: done }));
        })()
      );
    }

    await Promise.all(teamTasks);

    // Aplicar todas las URLs generadas a los drafts
    setDrafts((prev) =>
      prev.map((d) => {
        if (!targetIds.has(d.id)) return d;
        const upd = updates.get(d.id);
        return {
          ...d,
          homeLogo: upd?.homeLogo || d.homeLogo || '',
          awayLogo: upd?.awayLogo || d.awayLogo || '',
          homeType: 'kit' as const,
          awayType: 'kit' as const,
          homeLabel: 'Camiseta IA 26-27',
          awayLabel: 'Camiseta IA 26-27',
          isResolvingLogos: false,
        };
      })
    );

    setIsGeneratingKits(false);
    setKitsProgress({ current: 0, total: 0 });
  };

  /** Descarga una plantilla de Excel lista con las columnas solicitadas */
  const handleDownloadTemplate = () => {
    const headers = [
      ['NOMBRE LOCAL', 'NOMBRE VISITANTE', 'COMPETICIÓN', 'FECHA', 'HORA', 'APUESTA', 'CUOTA', 'PROBABILIDAD', 'CONFIANZA'],
      ['Shang Juncheng', 'Adrian Mannarino', 'ATP Chengdu', '25/09/2026', '08:40', 'Shang Hándicap (-1.5)', '1.47', '90%', '5'],
      ['Real Madrid', 'Barcelona', 'LaLiga EA Sports', '26/09/2026', '21:00', 'Más de 2.5 goles', '1.80', '85%', '4'],
      ['Los Angeles Lakers', 'Boston Celtics', 'NBA', '27/09/2026', '02:30', 'Lakers +4.5 Hándicap', '1.91', '75%', '4'],
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

    // Resuelve automáticamente banderas de tenis y camisetas de fútbol/basket con IA
    setTimeout(() => {
      resolveLogosForDrafts(newDrafts);
    }, 50);
  };

  /** Procesa archivo Excel o CSV */
  const handleFileUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });
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
      // SheetJS puede leer directamente texto separado por tabulaciones (TSV)
      const wb = XLSX.read(pasteText, { type: 'string' });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });
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
        const confNum = (d.confidence as PickConfidence) || 3;
        const startTimeIso = new Date(`${d.date}T${d.time}:00`).toISOString();

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

      {/* Configuración de Google Gemini (Imagen 3) para Camisetas Estilo Icono */}
      <div className={styles.aiConfigBox}>
        <div className={styles.aiConfigHeader}>
          <span className={styles.aiIcon}>✨</span>
          <span className={styles.aiTitle}>Google Gemini (Imagen 3) — Camisetas 3D Oficiales 2026-2027</span>
          <span className={geminiKey ? styles.aiBadgeActive : styles.aiBadgeIdle}>
            {geminiKey ? '🟢 Gemini Imagen 3 Activo' : '⚪ Fallback Automático'}
          </span>
        </div>
        <div className={styles.aiKeyRow}>
          <input
            type="password"
            className={styles.aiKeyInput}
            placeholder="Clave API de Google Gemini (AIza...) — Consíguela 100% gratis en aistudio.google.com"
            value={geminiKey}
            onChange={handleGeminiKeyChange}
          />
          <span className={styles.aiKeyHelp}>
            Genera camisetas estilo icono 3D con fondo oscuro y efecto cristal igual a la referencia. Consíguela gratis en{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(190 90% 60%)', textDecoration: 'underline' }}>
              aistudio.google.com
            </a>.
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
                disabled={isBulkResolvingLogos || isGeneratingKits || isSubmitting}
                title="Detectar banderas de tenistas con IA"
              >
                {isBulkResolvingLogos ? (
                  <>⏳ Buscando banderas...</>
                ) : (
                  <>🏳️ Banderas Tenis</>
                )}
              </button>

              <button
                type="button"
                className={styles.generateKitsBtn}
                onClick={() => generateKitsWithAI()}
                disabled={isGeneratingKits || isBulkResolvingLogos || isSubmitting}
                title="Generar automáticamente camisetas 3D oficiales con la IA de Google Gemini"
              >
                {isGeneratingKits ? (
                  <>✨ Generando {kitsProgress.current}/{kitsProgress.total} camisetas con Gemini...</>
                ) : (
                  <>✨ Generar Camisetas Gemini</>
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
                            title={
                              d.homeLabel
                                ? `${d.sport === 'tennis' ? 'Bandera: ' : 'Camiseta: '}${d.homeLabel}`
                                : d.sport === 'tennis'
                                ? 'Bandera de nacionalidad'
                                : 'Camiseta oficial'
                            }
                          >
                            {d.isResolvingLogos ? (
                              <span className={styles.miniSpinner}>⏳</span>
                            ) : d.homeLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={d.homeLogo}
                                alt={d.homeTeam}
                                className={`${styles.miniLogoImg} ${
                                  d.homeType === 'flag' || d.sport === 'tennis' || d.homeLogo.includes('flagcdn')
                                    ? styles.miniLogoFlag
                                    : styles.miniLogoKit
                                }`}
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
                            title={
                              d.awayLabel
                                ? `${d.sport === 'tennis' ? 'Bandera: ' : 'Camiseta: '}${d.awayLabel}`
                                : d.sport === 'tennis'
                                ? 'Bandera de nacionalidad'
                                : 'Camiseta oficial'
                            }
                          >
                            {d.isResolvingLogos ? (
                              <span className={styles.miniSpinner}>⏳</span>
                            ) : d.awayLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={d.awayLogo}
                                alt={d.awayTeam}
                                className={`${styles.miniLogoImg} ${
                                  d.awayType === 'flag' || d.sport === 'tennis' || d.awayLogo.includes('flagcdn')
                                    ? styles.miniLogoFlag
                                    : styles.miniLogoKit
                                }`}
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
                            {d.sport === 'tennis' ? '🎾 ' : '🎽 '}
                            {d.homeLabel || '—'} / {d.awayLabel || '—'}
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
                            homeLogo: isTennis ? '' : d.homeLogo,
                            awayLogo: isTennis ? '' : d.awayLogo,
                            homeLabel: '',
                            awayLabel: '',
                            homeType: (isTennis ? 'flag' : undefined) as any,
                            awayType: (isTennis ? 'flag' : undefined) as any,
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
