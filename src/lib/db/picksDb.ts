import fs from 'fs/promises';
import path from 'path';
import type { Pick } from '@/types/pick';
import { MOCK_PICKS } from '@/lib/data/mockPicks';
import { isKvConfigured, kvGetJson, kvSetJson } from '@/lib/db/kv';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'picks-db.json');
const TMP_FILE = path.join('/tmp', 'picks-db.json');

// Clave de los picks dentro de la base de datos conectada en .env.local
const KV_KEY = 'rogipicks:picks';

// Memoria global en runtime para serverless (solo si no hay base de datos remota)
const globalForPicks = globalThis as unknown as { __picksDbCache?: Pick[] };

// TTL: 30 días (1 mes)
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

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

/** Guarda en la base de datos remota y, como respaldo, en fichero local. */
async function writeDb(data: Pick[]): Promise<void> {
  globalForPicks.__picksDbCache = data;

  // 1. Base de datos remota (KV) — fuente de verdad para añadir/editar/borrar
  if (isKvConfigured()) {
    await kvSetJson(KV_KEY, data);
  }

  // 2. Respaldo local (data/picks-db.json y /tmp en serverless)
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, jsonStr, 'utf-8');
  } catch {
    try {
      await fs.writeFile(TMP_FILE, jsonStr, 'utf-8');
    } catch {
      // Si falla incluso /tmp, los datos ya están guardados en la base de datos remota
    }
  }
}

/** Lee el respaldo local (caché en memoria → data/ → /tmp). */
async function readLocalDb(): Promise<Pick[] | null> {
  if (globalForPicks.__picksDbCache) {
    return globalForPicks.__picksDbCache;
  }

  for (const file of [DB_FILE, TMP_FILE]) {
    try {
      const raw = await fs.readFile(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalForPicks.__picksDbCache = parsed;
        return parsed;
      }
    } catch {}
  }

  return null;
}

/**
 * Lee los picks.
 * - Si hay base de datos remota configurada, SIEMPRE se lee de ella
 *   (así los picks añadidos o borrados se reflejan al instante).
 * - `null` = nunca se han guardado picks; `[]` = guardados pero vacíos.
 */
async function readDb(): Promise<Pick[] | null> {
  const local = await readLocalDb();

  if (isKvConfigured()) {
    const remote = await kvGetJson<Pick[]>(KV_KEY);
    if (Array.isArray(remote)) {
      globalForPicks.__picksDbCache = remote;
      return remote;
    }

    // La base de datos remota aún no tiene la clave: migramos lo que hubiera en local
    if (local) {
      await kvSetJson(KV_KEY, local);
      return local;
    }

    return null;
  }

  return local;
}

async function ensureDbInitialized(): Promise<void> {
  const existing = await readDb();
  if (existing === null) {
    const initial = purgeExpiredPicks(MOCK_PICKS).activePicks;
    await writeDb(initial);
  }
}

export async function getAllPicks(): Promise<Pick[]> {
  await ensureDbInitialized();
  const picks = (await readDb()) ?? MOCK_PICKS;
  const { activePicks, purgedCount } = purgeExpiredPicks(picks);
  if (purgedCount > 0) {
    await writeDb(activePicks);
  }
  return activePicks;
}

export async function createPick(newPick: Pick): Promise<Pick> {
  await ensureDbInitialized();
  const currentPicks = await getAllPicks();
  const updated = [newPick, ...currentPicks];
  const { activePicks } = purgeExpiredPicks(updated);
  await writeDb(activePicks);
  return newPick;
}

export async function createPicks(newPicks: Pick[]): Promise<Pick[]> {
  await ensureDbInitialized();
  const currentPicks = await getAllPicks();
  const updated = [...newPicks, ...currentPicks];
  const { activePicks } = purgeExpiredPicks(updated);
  await writeDb(activePicks);
  return newPicks;
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
  await writeDb(activePicks);
  return updatedPick;
}

export async function deletePick(id: string): Promise<boolean> {
  await ensureDbInitialized();
  const currentPicks = await getAllPicks();
  const filtered = currentPicks.filter((p) => p.id !== id);
  if (filtered.length === currentPicks.length) return false;

  await writeDb(filtered);
  return true;
}
