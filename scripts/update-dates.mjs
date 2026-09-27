import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
let kvUrl = '';
let kvToken = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('KV_REST_API_URL=')) {
      kvUrl = trimmed.replace('KV_REST_API_URL=', '').replace(/['"]/g, '').trim();
    }
    if (trimmed.startsWith('KV_REST_API_TOKEN=')) {
      kvToken = trimmed.replace('KV_REST_API_TOKEN=', '').replace(/['"]/g, '').trim();
    }
  }
}

console.log('KV Config:', { hasUrl: !!kvUrl, hasToken: !!kvToken });

// 1. Update data/picks-db.json
const dbFile = path.resolve('data/picks-db.json');
let picks = [];
if (fs.existsSync(dbFile)) {
  picks = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  console.log(`Picks in local DB: ${picks.length}`);
  
  let modifiedCount = 0;
  for (const p of picks) {
    if (p.match?.startTime) {
      // Reemplazar 2026-09-25 o cualquier fecha anterior por 2026-09-27
      const oldTime = p.match.startTime;
      p.match.startTime = oldTime.replace(/2026-09-\d{2}/, '2026-09-27');
      modifiedCount++;
    }
    if (p.createdAt && p.createdAt.includes('2026-09-25')) {
      p.createdAt = p.createdAt.replace('2026-09-25', '2026-09-27');
    }
  }

  fs.writeFileSync(dbFile, JSON.stringify(picks, null, 2), 'utf-8');
  console.log(`Updated ${modifiedCount} picks in data/picks-db.json to 2026-09-27`);
}

// 2. Update Upstash KV if configured
if (kvUrl && kvToken) {
  try {
    const getRes = await fetch(`${kvUrl}/get/rogipicks:picks`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const data = await getRes.json();
    let kvPicks = [];
    if (data?.result) {
      kvPicks = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    }
    console.log(`Picks in Upstash KV: ${kvPicks.length}`);

    // Update dates in KV picks as well
    for (const p of kvPicks) {
      if (p.match?.startTime) {
        p.match.startTime = p.match.startTime.replace(/2026-09-\d{2}/, '2026-09-27');
      }
      if (p.createdAt && p.createdAt.includes('2026-09-25')) {
        p.createdAt = p.createdAt.replace('2026-09-25', '2026-09-27');
      }
    }

    // Si KV tiene picks o si queremos sincronizar con los picks locales actualizados:
    const targetPicks = kvPicks.length > 0 ? kvPicks : picks;
    const setRes = await fetch(`${kvUrl}/set/rogipicks:picks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.stringify(targetPicks))
    });
    const setResult = await setRes.json();
    console.log('Upstash KV updated:', setResult);
  } catch (err) {
    console.error('Error updating Upstash KV:', err);
  }
}
