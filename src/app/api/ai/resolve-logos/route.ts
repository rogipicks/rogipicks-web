import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ResolveItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  competition?: string;
}

interface ResolveRequest {
  items: ResolveItem[];
  apiKey?: string;
}

// ─── Diccionario extenso de jugadores de tenis (ATP, WTA, Challenger) ───
const TENNIS_PLAYERS_ISO: Record<string, { code: string; country: string }> = {
  // España (ATP & Challenger)
  alcaraz: { code: 'es', country: 'España' },
  nadal: { code: 'es', country: 'España' },
  davidovich: { code: 'es', country: 'España' },
  'davidovich fokina': { code: 'es', country: 'España' },
  bautista: { code: 'es', country: 'España' },
  'bautista agut': { code: 'es', country: 'España' },
  carballes: { code: 'es', country: 'España' },
  'carballes baena': { code: 'es', country: 'España' },
  martinez: { code: 'es', country: 'España' },
  'pedro martinez': { code: 'es', country: 'España' },
  munar: { code: 'es', country: 'España' },
  'alcala gurri': { code: 'es', country: 'España' },
  alcala: { code: 'es', country: 'España' },
  gurri: { code: 'es', country: 'España' },
  'martin tiffon': { code: 'es', country: 'España' },
  tiffon: { code: 'es', country: 'España' },
  'roca batalla': { code: 'es', country: 'España' },
  'sanchez izquierdo': { code: 'es', country: 'España' },
  rincon: { code: 'es', country: 'España' },
  landaluce: { code: 'es', country: 'España' },
  taberner: { code: 'es', country: 'España' },
  'barranco cosano': { code: 'es', country: 'España' },
  'llamas ruiz': { code: 'es', country: 'España' },
  'moro canas': { code: 'es', country: 'España' },
  'merida aguilar': { code: 'es', country: 'España' },
  ramos: { code: 'es', country: 'España' },
  'ramos vinolas': { code: 'es', country: 'España' },
  zapata: { code: 'es', country: 'España' },
  'zapata miralles': { code: 'es', country: 'España' },
  badosa: { code: 'es', country: 'España' },
  sorribes: { code: 'es', country: 'España' },
  'sorribes tormo': { code: 'es', country: 'España' },
  bouzas: { code: 'es', country: 'España' },
  'bouzas maneiro': { code: 'es', country: 'España' },
  masarova: { code: 'es', country: 'España' },
  parrizas: { code: 'es', country: 'España' },

  // Top ATP
  sinner: { code: 'it', country: 'Italia' },
  djokovic: { code: 'rs', country: 'Serbia' },
  zverev: { code: 'de', country: 'Alemania' },
  medvedev: { code: 'ru', country: 'Rusia' },
  rublev: { code: 'ru', country: 'Rusia' },
  hurkacz: { code: 'pl', country: 'Polonia' },
  ruud: { code: 'no', country: 'Noruega' },
  tsitsipas: { code: 'gr', country: 'Grecia' },
  'de minaur': { code: 'au', country: 'Australia' },
  dimitrov: { code: 'bg', country: 'Bulgaria' },
  fritz: { code: 'us', country: 'Estados Unidos' },
  shelton: { code: 'us', country: 'Estados Unidos' },
  paul: { code: 'us', country: 'Estados Unidos' },
  tiafoe: { code: 'us', country: 'Estados Unidos' },
  korda: { code: 'us', country: 'Estados Unidos' },
  giron: { code: 'us', country: 'Estados Unidos' },
  michelsen: { code: 'us', country: 'Estados Unidos' },
  kovacevic: { code: 'us', country: 'Estados Unidos' },
  nakashima: { code: 'us', country: 'Estados Unidos' },
  humbert: { code: 'fr', country: 'Francia' },
  mannarino: { code: 'fr', country: 'Francia' },
  monfils: { code: 'fr', country: 'Francia' },
  fils: { code: 'fr', country: 'Francia' },
  gasquet: { code: 'fr', country: 'Francia' },
  muller: { code: 'fr', country: 'Francia' },
  cazaux: { code: 'fr', country: 'Francia' },
  musetti: { code: 'it', country: 'Italia' },
  berrettini: { code: 'it', country: 'Italia' },
  cobolli: { code: 'it', country: 'Italia' },
  arnaldi: { code: 'it', country: 'Italia' },
  darderi: { code: 'it', country: 'Italia' },
  sonego: { code: 'it', country: 'Italia' },
  shang: { code: 'cn', country: 'China' },
  'shang juncheng': { code: 'cn', country: 'China' },
  zhang: { code: 'cn', country: 'China' },
  'zhang zhizhen': { code: 'cn', country: 'China' },
  bu: { code: 'cn', country: 'China' },
  'bu yunchaokete': { code: 'cn', country: 'China' },
  cerundolo: { code: 'ar', country: 'Argentina' },
  baez: { code: 'ar', country: 'Argentina' },
  etcheverry: { code: 'ar', country: 'Argentina' },
  navone: { code: 'ar', country: 'Argentina' },
  jarry: { code: 'cl', country: 'Chile' },
  tabilo: { code: 'cl', country: 'Chile' },
  garin: { code: 'cl', country: 'Chile' },
  'auger-aliassime': { code: 'ca', country: 'Canadá' },
  'auger aliassime': { code: 'ca', country: 'Canadá' },
  shapovalov: { code: 'ca', country: 'Canadá' },
  diallo: { code: 'ca', country: 'Canadá' },
  norrie: { code: 'gb', country: 'Reino Unido' },
  draper: { code: 'gb', country: 'Reino Unido' },
  evans: { code: 'gb', country: 'Reino Unido' },
  murray: { code: 'gb', country: 'Reino Unido' },
  rune: { code: 'dk', country: 'Dinamarca' },
  ruusuvuori: { code: 'fi', country: 'Finlandia' },
  goffin: { code: 'be', country: 'Bélgica' },
  bergs: { code: 'be', country: 'Bélgica' },
  wawrinka: { code: 'ch', country: 'Suiza' },
  thiem: { code: 'at', country: 'Austria' },
  ofner: { code: 'at', country: 'Austria' },
  khachanov: { code: 'ru', country: 'Rusia' },
  safullin: { code: 'ru', country: 'Rusia' },
  kotov: { code: 'ru', country: 'Rusia' },
  bublik: { code: 'kz', country: 'Kazajistán' },
  shevchenko: { code: 'kz', country: 'Kazajistán' },
  marozsan: { code: 'hu', country: 'Hungría' },
  fucsovics: { code: 'hu', country: 'Hungría' },
  struff: { code: 'de', country: 'Alemania' },
  altmaier: { code: 'de', country: 'Alemania' },
  hanfmann: { code: 'de', country: 'Alemania' },
  koepfer: { code: 'de', country: 'Alemania' },
  nishioka: { code: 'jp', country: 'Japón' },
  daniel: { code: 'jp', country: 'Japón' },
  nishikori: { code: 'jp', country: 'Japón' },
  kokkinakis: { code: 'au', country: 'Australia' },
  thompson: { code: 'au', country: 'Australia' },
  popyrin: { code: 'au', country: 'Australia' },
  vukic: { code: 'au', country: 'Australia' },
  mensik: { code: 'cz', country: 'República Checa' },
  lehecka: { code: 'cz', country: 'República Checa' },
  machac: { code: 'cz', country: 'República Checa' },
  coric: { code: 'hr', country: 'Croacia' },
  cilic: { code: 'hr', country: 'Croacia' },
  ajdukovic: { code: 'hr', country: 'Croacia' },
  gaubas: { code: 'lt', country: 'Lituania' },
  kym: { code: 'ch', country: 'Suiza' },
  rocha: { code: 'pt', country: 'Portugal' },
  faria: { code: 'pt', country: 'Portugal' },

  // Top WTA
  swiatek: { code: 'pl', country: 'Polonia' },
  sabalenka: { code: 'by', country: 'Bielorrusia' },
  gauff: { code: 'us', country: 'Estados Unidos' },
  rybakina: { code: 'kz', country: 'Kazajistán' },
  paolini: { code: 'it', country: 'Italia' },
  pegula: { code: 'us', country: 'Estados Unidos' },
  zheng: { code: 'cn', country: 'China' },
  'zheng qinwen': { code: 'cn', country: 'China' },
  vondrousova: { code: 'cz', country: 'República Checa' },
  sakkari: { code: 'gr', country: 'Grecia' },
  jabeur: { code: 'tn', country: 'Túnez' },
  ostapenko: { code: 'lv', country: 'Letonia' },
  kasatkina: { code: 'ru', country: 'Rusia' },
  collins: { code: 'us', country: 'Estados Unidos' },
  navarro: { code: 'us', country: 'Estados Unidos' },
  keys: { code: 'us', country: 'Estados Unidos' },
  kostyuk: { code: 'ua', country: 'Ucrania' },
  svitolina: { code: 'ua', country: 'Ucrania' },
  yastremska: { code: 'ua', country: 'Ucrania' },
  krejcikova: { code: 'cz', country: 'República Checa' },
  noskova: { code: 'cz', country: 'República Checa' },
  garcia: { code: 'fr', country: 'Francia' },
  alexandrova: { code: 'ru', country: 'Rusia' },
  samsonova: { code: 'ru', country: 'Rusia' },
  andreeva: { code: 'ru', country: 'Rusia' },
  'haddad maia': { code: 'br', country: 'Brasil' },
  raducanu: { code: 'gb', country: 'Reino Unido' },
  boulter: { code: 'gb', country: 'Reino Unido' },
  osaka: { code: 'jp', country: 'Japón' },
};

// Demónimos y nombres de países para búsqueda en Wikipedia
const DEMONYMS_MAP: Record<string, { code: string; country: string }> = {
  spanish: { code: 'es', country: 'España' },
  spaniard: { code: 'es', country: 'España' },
  spain: { code: 'es', country: 'España' },
  french: { code: 'fr', country: 'Francia' },
  france: { code: 'fr', country: 'Francia' },
  italian: { code: 'it', country: 'Italia' },
  italy: { code: 'it', country: 'Italia' },
  german: { code: 'de', country: 'Alemania' },
  germany: { code: 'de', country: 'Alemania' },
  american: { code: 'us', country: 'Estados Unidos' },
  'united states': { code: 'us', country: 'Estados Unidos' },
  usa: { code: 'us', country: 'Estados Unidos' },
  british: { code: 'gb', country: 'Reino Unido' },
  english: { code: 'gb', country: 'Reino Unido' },
  scottish: { code: 'gb', country: 'Reino Unido' },
  'united kingdom': { code: 'gb', country: 'Reino Unido' },
  australian: { code: 'au', country: 'Australia' },
  australia: { code: 'au', country: 'Australia' },
  argentine: { code: 'ar', country: 'Argentina' },
  argentinian: { code: 'ar', country: 'Argentina' },
  argentina: { code: 'ar', country: 'Argentina' },
  brazilian: { code: 'br', country: 'Brasil' },
  brazil: { code: 'br', country: 'Brasil' },
  chinese: { code: 'cn', country: 'China' },
  china: { code: 'cn', country: 'China' },
  japanese: { code: 'jp', country: 'Japón' },
  japan: { code: 'jp', country: 'Japón' },
  russian: { code: 'ru', country: 'Rusia' },
  russia: { code: 'ru', country: 'Rusia' },
  serbian: { code: 'rs', country: 'Serbia' },
  serbia: { code: 'rs', country: 'Serbia' },
  croatian: { code: 'hr', country: 'Croacia' },
  croatia: { code: 'hr', country: 'Croacia' },
  czech: { code: 'cz', country: 'República Checa' },
  'czech republic': { code: 'cz', country: 'República Checa' },
  polish: { code: 'pl', country: 'Polonia' },
  poland: { code: 'pl', country: 'Polonia' },
  ukrainian: { code: 'ua', country: 'Ucrania' },
  ukraine: { code: 'ua', country: 'Ucrania' },
  portuguese: { code: 'pt', country: 'Portugal' },
  portugal: { code: 'pt', country: 'Portugal' },
  swiss: { code: 'ch', country: 'Suiza' },
  switzerland: { code: 'ch', country: 'Suiza' },
  austrian: { code: 'at', country: 'Austria' },
  austria: { code: 'at', country: 'Austria' },
  dutch: { code: 'nl', country: 'Países Bajos' },
  netherlands: { code: 'nl', country: 'Países Bajos' },
  belgian: { code: 'be', country: 'Bélgica' },
  belgium: { code: 'be', country: 'Bélgica' },
  greek: { code: 'gr', country: 'Grecia' },
  greece: { code: 'gr', country: 'Grecia' },
  bulgarian: { code: 'bg', country: 'Bulgaria' },
  bulgaria: { code: 'bg', country: 'Bulgaria' },
  romanian: { code: 'ro', country: 'Rumanía' },
  romania: { code: 'ro', country: 'Rumanía' },
  hungarian: { code: 'hu', country: 'Hungría' },
  hungary: { code: 'hu', country: 'Hungría' },
  lithuanian: { code: 'lt', country: 'Lituania' },
  lithuania: { code: 'lt', country: 'Lituania' },
  kazakh: { code: 'kz', country: 'Kazajistán' },
  kazakhstani: { code: 'kz', country: 'Kazajistán' },
  chilean: { code: 'cl', country: 'Chile' },
  chile: { code: 'cl', country: 'Chile' },
  colombian: { code: 'co', country: 'Colombia' },
  colombia: { code: 'co', country: 'Colombia' },
  canadian: { code: 'ca', country: 'Canadá' },
  canada: { code: 'ca', country: 'Canadá' },
  norwegian: { code: 'no', country: 'Noruega' },
  danish: { code: 'dk', country: 'Dinamarca' },
  finnish: { code: 'fi', country: 'Finlandia' },
  swedish: { code: 'se', country: 'Suecia' },
  slovak: { code: 'sk', country: 'Eslovaquia' },
  slovenian: { code: 'si', country: 'Eslovenia' },
  tunisian: { code: 'tn', country: 'Túnez' },
  mexican: { code: 'mx', country: 'México' },
};

// ─── Camisetas oficiales directas temporada 2026-2027 (Estilo Icono) ───
const CURATED_KITS: Record<string, string> = {
  // Fútbol 2026-2027 (Estilo Icono)
  'real madrid': '/images/kits/real-madrid-26-27.jpg',
  madrid: '/images/kits/real-madrid-26-27.jpg',
  barcelona: '/images/kits/barcelona-26-27.jpg',
  'fc barcelona': '/images/kits/barcelona-26-27.jpg',
  barca: '/images/kits/barcelona-26-27.jpg',
  'atletico madrid': '/images/kits/atletico-26-27.jpg',
  'atletico de madrid': '/images/kits/atletico-26-27.jpg',
  atleti: '/images/kits/atletico-26-27.jpg',
  'manchester city': '/images/kits/mancity-26-27.jpg',
  'man city': '/images/kits/mancity-26-27.jpg',
  mancity: '/images/kits/mancity-26-27.jpg',
  arsenal: '/images/kits/arsenal-26-27.jpg',
  liverpool: '/images/kits/liverpool-26-27.jpg',
  'paris saint-germain': '/images/kits/psg-26-27.jpg',
  'paris saint germain': '/images/kits/psg-26-27.jpg',
  psg: '/images/kits/psg-26-27.jpg',
  'manchester united': 'https://r2.thesportsdb.com/images/media/team/equipment/j1q9q11750591349.png',
  chelsea: 'https://r2.thesportsdb.com/images/media/team/equipment/0h36v21750591207.png',
  'bayern munich': 'https://r2.thesportsdb.com/images/media/team/equipment/v8b3j01750591179.png',
  'bayern munchen': 'https://r2.thesportsdb.com/images/media/team/equipment/v8b3j01750591179.png',
  'borussia dortmund': 'https://r2.thesportsdb.com/images/media/team/equipment/x00x821750591195.png',
  dortmund: 'https://r2.thesportsdb.com/images/media/team/equipment/x00x821750591195.png',
  juventus: 'https://r2.thesportsdb.com/images/media/team/equipment/e9h9h31750591280.png',
  'inter milan': 'https://r2.thesportsdb.com/images/media/team/equipment/b7o9o11750591268.png',
  inter: 'https://r2.thesportsdb.com/images/media/team/equipment/b7o9o11750591268.png',
  'ac milan': 'https://r2.thesportsdb.com/images/media/team/equipment/q5l0o41750591336.png',
  milan: 'https://r2.thesportsdb.com/images/media/team/equipment/q5l0o41750591336.png',
  tottenham: 'https://r2.thesportsdb.com/images/media/team/equipment/s3z1s81750591375.png',
  'aston villa': 'https://r2.thesportsdb.com/images/media/team/equipment/j0k8o31750591162.png',
  newcastle: 'https://r2.thesportsdb.com/images/media/team/equipment/b9q8o11750591361.png',

  // Baloncesto 2026-2027 (Estilo Icono)
  'los angeles lakers': '/images/kits/lakers-26-27.jpg',
  lakers: '/images/kits/lakers-26-27.jpg',
  'boston celtics': '/images/kits/celtics-26-27.jpg',
  celtics: '/images/kits/celtics-26-27.jpg',
  'golden state warriors': '/images/kits/warriors-26-27.jpg',
  warriors: '/images/kits/warriors-26-27.jpg',
  'chicago bulls': 'https://r2.thesportsdb.com/images/media/team/equipment/dsv06i1507043743.png',
  bulls: 'https://r2.thesportsdb.com/images/media/team/equipment/dsv06i1507043743.png',
  'miami heat': 'https://r2.thesportsdb.com/images/media/team/equipment/9z11641507048039.png',
  heat: 'https://r2.thesportsdb.com/images/media/team/equipment/9z11641507048039.png',
  'milwaukee bucks': 'https://r2.thesportsdb.com/images/media/team/equipment/m2w14q1507048473.png',
  bucks: 'https://r2.thesportsdb.com/images/media/team/equipment/m2w14q1507048473.png',
  'dallas mavericks': 'https://r2.thesportsdb.com/images/media/team/equipment/991vwt1507044565.png',
  mavericks: 'https://r2.thesportsdb.com/images/media/team/equipment/991vwt1507044565.png',
  'new york knicks': 'https://r2.thesportsdb.com/images/media/team/equipment/wspqyy1507049449.png',
  knicks: 'https://r2.thesportsdb.com/images/media/team/equipment/wspqyy1507049449.png',
  'denver nuggets': 'https://r2.thesportsdb.com/images/media/team/equipment/j129z61507045136.png',
  nuggets: 'https://r2.thesportsdb.com/images/media/team/equipment/j129z61507045136.png',
  'philadelphia 76ers': 'https://r2.thesportsdb.com/images/media/team/equipment/uqvxyv1507049755.png',
  'phoenix suns': 'https://r2.thesportsdb.com/images/media/team/equipment/yvssvx1507049977.png',
};

/** Normaliza texto quitando tildes y signos */
function cleanStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * 1. Resuelve la bandera de un tenista desde el diccionario local
 */
function resolveFromDictionary(playerName: string): { logoUrl: string; country: string } | null {
  const clean = cleanStr(playerName);
  if (!clean) return null;

  // Coincidencia exacta o contenida
  for (const [key, val] of Object.entries(TENNIS_PLAYERS_ISO)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return {
        logoUrl: `https://flagcdn.com/w160/${val.code.toLowerCase()}.png`,
        country: val.country,
      };
    }
  }

  // Comprobar palabras / apellidos individuales
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (w.length < 3) continue;
    if (TENNIS_PLAYERS_ISO[w]) {
      const val = TENNIS_PLAYERS_ISO[w];
      return {
        logoUrl: `https://flagcdn.com/w160/${val.code.toLowerCase()}.png`,
        country: val.country,
      };
    }
  }

  return null;
}

/**
 * 2. Consulta en Wikipedia la nacionalidad del tenista en tiempo real
 */
async function resolveViaWikipedia(playerName: string): Promise<{ logoUrl: string; country: string } | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      playerName + ' tennis'
    )}&format=json`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'RogiPicks/1.0 (contact@rogipicks.com)' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const hits = data?.query?.search || [];

    for (const h of hits) {
      const text = `${h.title} ${h.snippet}`.toLowerCase().replace(/<[^>]+>/g, '');
      for (const [dem, info] of Object.entries(DEMONYMS_MAP)) {
        const reg = new RegExp(`\\b${dem}\\b`, 'i');
        if (reg.test(text)) {
          return {
            logoUrl: `https://flagcdn.com/w160/${info.code.toLowerCase()}.png`,
            country: info.country,
          };
        }
      }
    }
  } catch (err) {
    // Continuar si falla la red puntual de Wikipedia
  }
  return null;
}

/**
 * 3. Consulta en TheSportsDB la camiseta actual (strEquipment) o escudo (strBadge) para fútbol/basket
 */
async function searchTheSportsDBKit(teamName: string): Promise<string | null> {
  const clean = cleanStr(teamName);

  if (CURATED_KITS[clean]) {
    return CURATED_KITS[clean];
  }
  for (const [k, url] of Object.entries(CURATED_KITS)) {
    if (clean.includes(k) || k.includes(clean)) {
      return url;
    }
  }

  const queries: string[] = [
    teamName,
    teamName.replace(/[-_]/g, ' '),
    teamName.replace(/^(fc|cf|cd|real|club|deportivo|sporting|ud|baloncesto|basket)\s+/i, ''),
    teamName.replace(/\s+(fc|cf|bc|basket|baloncesto)$/i, ''),
  ];

  const words = clean.split(/\s+/).filter((w) => w.length > 3);
  if (words.length > 0 && !queries.includes(words[0])) {
    queries.push(words[0]);
  }

  for (const q of queries) {
    if (!q || q.length < 3) continue;
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q.trim())}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) continue;
      const data = await res.json();
      if (!data?.teams || data.teams.length === 0) continue;

      const withEquipment = data.teams.find((t: any) => t.strEquipment);
      if (withEquipment?.strEquipment) {
        return withEquipment.strEquipment;
      }

      const withBadge = data.teams.find((t: any) => t.strBadge);
      if (withBadge?.strBadge) {
        return withBadge.strBadge;
      }
    } catch {
      // Ignorar
    }
  }

  return null;
}

/**
 * 4. Consulta a Groq AI (Llama) si las capas anteriores no encontraron la nacionalidad
 */
async function resolveTennisWithGroq(
  playerName: string,
  apiKey?: string
): Promise<{ logoUrl: string; country: string } | null> {
  const groqKey =
    apiKey?.trim() ||
    process.env.GROQ_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim() ||
    process.env.XAI_API_KEY?.trim() ||
    '';

  if (!groqKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Responde estrictamente con un JSON con el código ISO de 2 letras y nombre del país en español de este tenista. Ej: {"code": "es", "country": "España"}',
          },
          { role: 'user', content: `Tenista: ${playerName}` },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed?.code) {
          const code = parsed.code.toLowerCase();
          return {
            logoUrl: `https://flagcdn.com/w160/${code}.png`,
            country: parsed.country || code.toUpperCase(),
          };
        }
      }
    }
  } catch {
    // Ignorar
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body: ResolveRequest = await req.json();
    const { items, apiKey } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await Promise.all(
      items.map(async (item) => {
        let homeLogo = '';
        let awayLogo = '';
        let homeLabel = '';
        let awayLabel = '';
        let homeType: 'flag' | 'kit' | 'badge' = 'badge';
        let awayType: 'flag' | 'kit' | 'badge' = 'badge';

        if (item.sport === 'tennis') {
          // ─── TENIS: SIEMPRE BANDERAS DE PAÍSES, NUNCA ESCUDOS ───
          homeType = 'flag';
          awayType = 'flag';

          // 1. Resolver jugador local
          const localHome =
            resolveFromDictionary(item.homeTeam) ||
            (await resolveViaWikipedia(item.homeTeam)) ||
            (await resolveTennisWithGroq(item.homeTeam, apiKey));

          if (localHome) {
            homeLogo = localHome.logoUrl;
            homeLabel = localHome.country;
          } else {
            // Si no se encuentra, por defecto bandera española si el torneo es nacional o bandera internacional
            homeLogo = 'https://flagcdn.com/w160/es.png';
            homeLabel = 'España';
          }

          // 2. Resolver jugador visitante
          const localAway =
            resolveFromDictionary(item.awayTeam) ||
            (await resolveViaWikipedia(item.awayTeam)) ||
            (await resolveTennisWithGroq(item.awayTeam, apiKey));

          if (localAway) {
            awayLogo = localAway.logoUrl;
            awayLabel = localAway.country;
          } else {
            awayLogo = 'https://flagcdn.com/w160/es.png';
            awayLabel = 'España';
          }
        } else if (item.sport === 'football' || item.sport === 'basketball') {
          // ─── FÚTBOL Y BALONCESTO: Camiseta oficial actual ───
          const [homeKit, awayKit] = await Promise.all([
            searchTheSportsDBKit(item.homeTeam),
            searchTheSportsDBKit(item.awayTeam),
          ]);

          if (homeKit) {
            homeLogo = homeKit;
            homeType = 'kit';
            homeLabel = homeKit.includes('26-27') ? 'Camiseta 26-27' : 'Camiseta oficial';
          }
          if (awayKit) {
            awayLogo = awayKit;
            awayType = 'kit';
            awayLabel = awayKit.includes('26-27') ? 'Camiseta 26-27' : 'Camiseta oficial';
          }
        } else {
          // Otros deportes
          const [homeFallback, awayFallback] = await Promise.all([
            searchTheSportsDBKit(item.homeTeam),
            searchTheSportsDBKit(item.awayTeam),
          ]);
          if (homeFallback) homeLogo = homeFallback;
          if (awayFallback) awayLogo = awayFallback;
        }

        return {
          id: item.id,
          homeLogo,
          awayLogo,
          homeLabel,
          awayLabel,
          homeType,
          awayType,
        };
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error in /api/ai/resolve-logos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al resolver logos y banderas.' },
      { status: 500 }
    );
  }
}
