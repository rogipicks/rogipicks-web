/**
 * Cliente mínimo de Vercel KV / Upstash Redis (REST, sin dependencias).
 *
 * Usa las variables de entorno de la base de datos conectada en .env.local:
 *   KV_REST_API_URL / KV_REST_API_TOKEN
 * (también admite los nombres nativos de Upstash:
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
 *
 * Si no hay credenciales configuradas, todas las funciones devuelven null/false
 * y la app sigue funcionando con el almacenamiento en fichero de `data/`.
 */

const KV_URL = (
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  ''
).replace(/\/$/, '');

const KV_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  '';

/** ¿Está configurada la base de datos remota? */
export function isKvConfigured(): boolean {
  return Boolean(KV_URL && KV_TOKEN);
}

/**
 * Ejecuta un comando de Redis vía la API REST (formato de cuerpo:
 * POST {url} con ["COMANDO", "arg1", ...]).
 */
async function kvCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  if (!isKvConfigured()) return null;

  try {
    const res = await fetch(KV_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[kv] ${command[0]} falló con HTTP ${res.status}`);
      return null;
    }

    const json = (await res.json()) as { result?: T; error?: string };

    if (json.error) {
      console.error(`[kv] ${command[0]} error: ${json.error}`);
      return null;
    }

    return json.result ?? null;
  } catch (err) {
    console.error(`[kv] ${command[0]} excepción:`, err);
    return null;
  }
}

/** Lee un valor de texto de la base de datos. */
export async function kvGet(key: string): Promise<string | null> {
  const result = await kvCommand<string>(['GET', key]);
  return typeof result === 'string' ? result : null;
}

/** Guarda un valor de texto en la base de datos. */
export async function kvSet(key: string, value: string): Promise<boolean> {
  const result = await kvCommand<string>(['SET', key, value]);
  return result === 'OK';
}

/** Elimina una clave de la base de datos. */
export async function kvDel(key: string): Promise<boolean> {
  const result = await kvCommand<number>(['DEL', key]);
  return typeof result === 'number' && result > 0;
}

/** Lee y parsea un valor JSON almacenado en la base de datos. */
export async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    console.error(`[kv] JSON inválido en la clave "${key}"`);
    return null;
  }
}

/** Serializa y guarda un valor JSON en la base de datos. */
export async function kvSetJson(key: string, value: unknown): Promise<boolean> {
  return kvSet(key, JSON.stringify(value));
}