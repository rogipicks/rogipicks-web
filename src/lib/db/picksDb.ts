import fs from 'fs/promises';
import path from 'path';
import type { Pick } from '@/types/pick';
import { MOCK_PICKS } from '@/lib/data/mockPicks';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'picks-db.json');

// TTL: 30 días (1 mes)
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Filtra automáticamente los picks que tengan más de 30 días desde su fecha de creación
 */
export function purgeExpiredPicks(picks: Pick[]): { activePicks: Pick[]; purgedCount: number } {
  const now = Date.now();
  const activePicks = picks.filter((p) => {
    if (!p.createdAt) return true;
    const createdTime = new Date(p.createdAt).getTime();
    if (isNaN(createdTime)) return true;
    return now - createdTime <= ONE_MONTH_MS;
  });
  return {
    activePicks,
    purgedCount: picks.length - activePicks.length,
  };
}

async function ensureDbInitialized(): Promise<void> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      // Si no existe, inicializar con MOCK_PICKS
      const initial = purgeExpiredPicks(MOCK_PICKS).activePicks;
      await fs.writeFile(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing picks DB:', err);
  }
}

export async function getAllPicks(): Promise<Pick[]> {
  await ensureDbInitialized();
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const picks: Pick[] = JSON.parse(raw);

    // Auto-purga de registros con más de 1 mes
    const { activePicks, purgedCount } = purgeExpiredPicks(picks);
    if (purgedCount > 0) {
      await fs.writeFile(DB_FILE, JSON.stringify(activePicks, null, 2), 'utf-8');
    }
    return activePicks;
  } catch (err) {
    console.error('Error reading picks DB:', err);
    return [];
  }
}

export async function createPick(newPick: Pick): Promise<Pick> {
  await ensureDbInitialized();
  const currentPicks = await getAllPicks();
  const updated = [newPick, ...currentPicks];
  const { activePicks } = purgeExpiredPicks(updated);
  await fs.writeFile(DB_FILE, JSON.stringify(activePicks, null, 2), 'utf-8');
  return newPick;
}

export async function updatePick(id: string, partialPick: Partial<Pick>): Promise<Pick | null> {
  await ensureDbInitialized();
  const currentPicks = await getAllPicks();
  const index = currentPicks.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedPick: Pick = {
    ...currentPicks[index],
    ...partialPick,
    updatedAt: new Date().toISOString(),
  };

  currentPicks[index] = updatedPick;
  const { activePicks } = purgeExpiredPicks(currentPicks);
  await fs.writeFile(DB_FILE, JSON.stringify(activePicks, null, 2), 'utf-8');
  return updatedPick;
}

export async function deletePick(id: string): Promise<boolean> {
  await ensureDbInitialized();
  const currentPicks = await getAllPicks();
  const filtered = currentPicks.filter((p) => p.id !== id);
  if (filtered.length === currentPicks.length) return false;

  await fs.writeFile(DB_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}
