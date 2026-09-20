/**
 * Reescala y re-comprime las imágenes base64 guardadas en la base de retos
 * (portada y logos de pasos), guarda el resultado en la base remota (KV)
 * y en el respaldo local. Crea una copia de seguridad del contenido original.
 *
 * Uso:  node scripts/compress-retos-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'data', 'retos-db.json');
const KV_KEY = 'rogipicks:retos';

function loadEnvLocal() {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnvLocal();
const KV_URL = (env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
const KV_TOKEN = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || '';
const hasKv = Boolean(KV_URL && KV_TOKEN);

async function kvGet(key) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', key]),
  });
  const json = await res.json();
  return typeof json.result === 'string' ? json.result : null;
}

async function kvSet(key, value) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, value]),
  });
  const json = await res.json();
  return json.result === 'OK';
}

async function compressDataUrl(dataUrl, maxDim, quality) {
  const match = /^data:image\/[a-z+]+;base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const input = Buffer.from(match[1], 'base64');
  const out = await sharp(input)
    .rotate()
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
  return `data:image/webp;base64,${out.toString('base64')}`;
}

// Portada: se muestra a lo ancho de la tarjeta (200px alto, ~800px ancho ×2 retina)
// Logos: se muestran en cajas de 52px
const RULES = {
  cover: { maxDim: 1280, quality: 72 },
  logo: { maxDim: 256, quality: 80 },
};

async function main() {
  // 1. Contenido original: base remota si hay credenciales, si no el fichero local
  let raw = hasKv ? await kvGet(KV_KEY) : null;
  if (!raw && fs.existsSync(DATA_FILE)) raw = fs.readFileSync(DATA_FILE, 'utf8');
  if (!raw) {
    console.error(`No se encontraron retos ni en la base remota ni en ${DATA_FILE}`);
    process.exit(1);
  }

  const retos = JSON.parse(raw);

  // 2. Copia de seguridad del contenido original
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(ROOT, 'data', `retos-db.backup-${stamp}.json`);
  fs.writeFileSync(backupFile, raw, 'utf8');

  // 3. Comprimir cada imagen (solo si el resultado pesa menos)
  let replaced = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;
  for (const reto of retos) {
    if (typeof reto.coverImage === 'string' && reto.coverImage.startsWith('data:')) {
      bytesBefore += reto.coverImage.length;
      const next = await compressDataUrl(reto.coverImage, RULES.cover.maxDim, RULES.cover.quality);
      if (next && next.length < reto.coverImage.length) {
        bytesAfter += next.length;
        reto.coverImage = next;
        replaced++;
      } else {
        bytesAfter += reto.coverImage.length;
      }
    }
    for (const step of reto.steps ?? []) {
      for (const field of ['homeLogo', 'awayLogo']) {
        const value = step[field];
        if (typeof value === 'string' && value.startsWith('data:')) {
          bytesBefore += value.length;
          const next = await compressDataUrl(value, RULES.logo.maxDim, RULES.logo.quality);
          if (next && next.length < value.length) {
            bytesAfter += next.length;
            step[field] = next;
            replaced++;
          } else {
            bytesAfter += value.length;
          }
        }
      }
    }
  }

  const out = JSON.stringify(retos, null, 2);

  // 4. Guardar: fichero local siempre; base remota si hay credenciales
  fs.writeFileSync(DATA_FILE, out, 'utf8');
  if (hasKv) await kvSet(KV_KEY, out);

  console.log(`Backup: ${backupFile}`);
  console.log(`Imagenes re-comprimidas: ${replaced}`);
  console.log(`JSON: ${(raw.length / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB`);
  console.log(`Imagenes: ${(bytesBefore / 1024).toFixed(0)} KB -> ${(bytesAfter / 1024).toFixed(0)} KB`);
  console.log(hasKv ? `Base remota actualizada (${KV_KEY})` : 'Sin base remota: solo fichero local');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
