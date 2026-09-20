import fs from 'fs/promises';
import path from 'path';
import type { Reto } from '@/types/reto';
import { MOCK_RETOS } from '@/lib/data/mockRetos';
import { isKvConfigured, kvGetJson, kvSetJson } from '@/lib/db/kv';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'retos-db.json');
const TMP_FILE = path.join('/tmp', 'retos-db.json');

// Clave de los retos dentro de la base de datos conectada en .env.local
const KV_KEY = 'rogipicks:retos';

// Memoria global en runtime para serverless (solo si no hay base de datos remota)
const globalForRetos = globalThis as unknown as {
  __retosDbCache?: Reto[];
  __retosDbCacheAt?: number;
};

/** TTL de la caché en memoria: evita repetir la lectura remota en cada visita. */
const CACHE_TTL_MS = 20_000;

function setCache(data: Reto[]): void {
  globalForRetos.__retosDbCache = data;
  globalForRetos.__retosDbCacheAt = Date.now();
}

/** Guarda en la base de datos remota y, como respaldo, en fichero local. */
async function writeDb(data: Reto[]): Promise<void> {
  setCache(data);

  // 1. Base de datos remota (KV) — fuente de verdad para añadir/editar/borrar
  if (isKvConfigured()) {
    await kvSetJson(KV_KEY, data);
  }

  // 2. Respaldo local (data/retos-db.json y /tmp en serverless)
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
async function readLocalDb(): Promise<Reto[] | null> {
  if (globalForRetos.__retosDbCache) {
    return globalForRetos.__retosDbCache;
  }

  for (const file of [DB_FILE, TMP_FILE]) {
    try {
      const raw = await fs.readFile(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalForRetos.__retosDbCache = parsed;
        return parsed;
      }
    } catch {}
  }

  return null;
}

/**
 * Lectura completa contra la fuente de datos.
 * - Si hay base de datos remota configurada, SIEMPRE se lee de ella
 *   (así los retos añadidos o borrados se reflejan al instante).
 * - `null` = nunca se han guardado retos; `[]` = guardados pero vacíos.
 */
async function readRemoteDb(): Promise<Reto[] | null> {
  const local = await readLocalDb();

  if (isKvConfigured()) {
    const remote = await kvGetJson<Reto[]>(KV_KEY);
    if (Array.isArray(remote)) {
      setCache(remote);
      return remote;
    }

    // La base de datos remota aún no tiene la clave: migramos lo que hubiera en local
    if (local) {
      await kvSetJson(KV_KEY, local);
      setCache(local);
      return local;
    }

    return null;
  }

  return local;
}

/**
 * Lectura para render: si la última lectura es reciente (< TTL) se devuelve
 * la caché en memoria sin volver a contactar con la base de datos remota.
 */
async function readDb(): Promise<Reto[] | null> {
  const cached = globalForRetos.__retosDbCache;
  if (cached && (globalForRetos.__retosDbCacheAt ?? 0) > Date.now() - CACHE_TTL_MS) {
    return cached;
  }
  return readRemoteDb();
}

/** Lee e inicializa con los retos de ejemplo si aún no se ha guardado nada. */
async function readDbOrInit(readFresh: boolean): Promise<Reto[]> {
  const existing = readFresh ? await readRemoteDb() : await readDb();
  if (existing !== null) return existing;
  await writeDb(MOCK_RETOS);
  return MOCK_RETOS;
}

export async function getAllRetos(): Promise<Reto[]> {
  return readDbOrInit(false);
}

export async function createReto(newReto: Reto): Promise<Reto> {
  const currentRetos = await readDbOrInit(true);
  const updated = [newReto, ...currentRetos];
  await writeDb(updated);
  return newReto;
}

export async function updateReto(id: string, partial: Partial<Reto>): Promise<Reto | null> {
  const currentRetos = await readDbOrInit(true);
  const index = currentRetos.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedReto: Reto = {
    ...currentRetos[index],
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  currentRetos[index] = updatedReto;
  await writeDb([...currentRetos]);
  return updatedReto;
}

export async function deleteReto(id: string): Promise<boolean> {
  const currentRetos = await readDbOrInit(true);
  const filtered = currentRetos.filter((r) => r.id !== id);
  if (filtered.length === currentRetos.length) return false;

  await writeDb(filtered);
  return true;
}
