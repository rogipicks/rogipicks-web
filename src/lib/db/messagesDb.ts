/**
 * Persistencia de los mensajes del formulario de contacto.
 *
 * Mismo criterio que picksDb/retosDb: si hay base de datos remota (KV) se usa
 * como fuente de verdad y, como respaldo, se guarda el JSON en `data/`.
 * Con eso los mensajes no se pierden si no hay KV configurado en local.
 */

import fs from 'fs/promises';
import path from 'path';
import type { ContactMessage, ContactMessageStatus } from '@/types/contactMessage';
import { isKvConfigured, kvGetJson, kvSetJson } from '@/lib/db/kv';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'contact-messages.json');
const TMP_FILE = path.join('/tmp', 'contact-messages.json');

// Clave de los mensajes dentro de la base de datos conectada en .env.local
const KV_KEY = 'rogipicks:contact-messages';

// Memoria global en runtime para serverless (solo si no hay base de datos remota)
const globalForMessages = globalThis as unknown as {
  __contactMessagesCache?: ContactMessage[];
};

/** Guarda en la base de datos remota y, como respaldo, en fichero local. */
async function writeDb(data: ContactMessage[]): Promise<void> {
  globalForMessages.__contactMessagesCache = data;

  if (isKvConfigured()) {
    await kvSetJson(KV_KEY, data);
  }

  const jsonStr = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, jsonStr, 'utf-8');
  } catch {
    try {
      await fs.writeFile(TMP_FILE, jsonStr, 'utf-8');
    } catch {
      // Si falla incluso /tmp, los datos ya están en la base de datos remota
    }
  }
}

/** Lee el respaldo local (caché en memoria → data/ → /tmp). */
async function readLocalDb(): Promise<ContactMessage[] | null> {
  if (globalForMessages.__contactMessagesCache) {
    return globalForMessages.__contactMessagesCache;
  }

  for (const file of [DB_FILE, TMP_FILE]) {
    try {
      const raw = await fs.readFile(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalForMessages.__contactMessagesCache = parsed;
        return parsed;
      }
    } catch {}
  }

  return null;
}

/** Lee los mensajes priorizando la base de datos remota (si está configurada). */
async function readDb(): Promise<ContactMessage[] | null> {
  const local = await readLocalDb();

  if (isKvConfigured()) {
    const remote = await kvGetJson<ContactMessage[]>(KV_KEY);
    if (Array.isArray(remote)) {
      globalForMessages.__contactMessagesCache = remote;
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

/** Todos los mensajes, del más reciente al más antiguo. */
export async function getAllMessages(): Promise<ContactMessage[]> {
  const messages = (await readDb()) ?? [];
  return [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Guarda un mensaje nuevo (se añade al principio, ya viene con id y fecha). */
export async function createMessage(message: ContactMessage): Promise<ContactMessage> {
  const current = (await readDb()) ?? [];
  await writeDb([message, ...current]);
  return message;
}

/** Cambia el estado de un mensaje (nuevo → leído → respondido). */
export async function updateMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessage | null> {
  const current = (await readDb()) ?? [];
  const index = current.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updated: ContactMessage = { ...current[index], status };
  current[index] = updated;
  await writeDb(current);
  return updated;
}

/** Borra un mensaje por su id. */
export async function deleteMessage(id: string): Promise<boolean> {
  const current = (await readDb()) ?? [];
  const filtered = current.filter((m) => m.id !== id);
  if (filtered.length === current.length) return false;

  await writeDb(filtered);
  return true;
}