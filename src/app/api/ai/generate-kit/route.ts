import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface GenerateKitRequest {
  teamName: string;
  sport: 'football' | 'basketball' | 'tennis' | string;
  competition?: string;
  apiKey?: string; // Google Gemini API Key
}

// ─── Estilo Icono 3D 2026-2027 (Idéntico a la segunda imagen de referencia) ──────
const ICON_BASE_STYLE =
  'High-end mobile sports app icon style, dark glossy navy blue background with subtle vignette and glassmorphism rounded square border, polished studio lighting, clean edges, premium 3D graphic design.';

const TEAM_KIT_PROMPTS: Record<string, string> = {
  // Fútbol
  'real madrid':
    `A sleek, modern 3D icon of the Real Madrid 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the white jersey shirt with subtle diamond texture, gold and dark navy trim details, official Emirates Fly Better sponsor and Real Madrid crest on chest. ${ICON_BASE_STYLE}`,
  madrid:
    `A sleek, modern 3D icon of the Real Madrid 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the white jersey shirt, gold trim, Emirates Fly Better and Real Madrid crest on chest. ${ICON_BASE_STYLE}`,
  barcelona:
    `A sleek, modern 3D icon of the FC Barcelona 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the jersey shirt, vibrant blaugrana stripes (deep garnet red and royal blue), golden Spotify logo and club crest on chest. ${ICON_BASE_STYLE}`,
  'fc barcelona':
    `A sleek, modern 3D icon of the FC Barcelona 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the jersey shirt, vibrant blaugrana stripes (deep garnet red and royal blue), golden Spotify logo and club crest on chest. ${ICON_BASE_STYLE}`,
  barca:
    `A sleek, modern 3D icon of the FC Barcelona 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the jersey shirt, vibrant blaugrana stripes, golden Spotify logo and club crest on chest. ${ICON_BASE_STYLE}`,
  'atletico madrid':
    `A sleek, modern 3D icon of the Atletico de Madrid 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the red and white vertical stripes jersey, navy blue collar, official club crest on chest. ${ICON_BASE_STYLE}`,
  'atletico de madrid':
    `A sleek, modern 3D icon of the Atletico de Madrid 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the red and white vertical stripes jersey, navy blue collar, official club crest on chest. ${ICON_BASE_STYLE}`,
  atleti:
    `A sleek, modern 3D icon of the Atletico de Madrid 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the red and white vertical stripes jersey, navy blue collar, official club crest on chest. ${ICON_BASE_STYLE}`,
  'manchester city':
    `A sleek, modern 3D icon of the Manchester City 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the sky blue jersey shirt, official club crest on chest, Puma and Etihad Airways sponsor. ${ICON_BASE_STYLE}`,
  'man city':
    `A sleek, modern 3D icon of the Manchester City 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the sky blue jersey shirt, official club crest on chest, Puma and Etihad Airways sponsor. ${ICON_BASE_STYLE}`,
  mancity:
    `A sleek, modern 3D icon of the Manchester City 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the sky blue jersey shirt, official club crest on chest, Puma and Etihad Airways sponsor. ${ICON_BASE_STYLE}`,
  arsenal:
    `A sleek, modern 3D icon of the Arsenal 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the red jersey shirt with white sleeves, official Arsenal cannon crest on chest, Adidas logo and Fly Emirates sponsor. ${ICON_BASE_STYLE}`,
  liverpool:
    `A sleek, modern 3D icon of the Liverpool FC 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the deep crimson red jersey shirt with subtle pattern, official Liverpool Liverbird crest on chest, Nike Swoosh and Standard Chartered sponsor. ${ICON_BASE_STYLE}`,
  'paris saint-germain':
    `A sleek, modern 3D icon of the Paris Saint-Germain PSG 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the midnight navy blue jersey shirt with red and white central hechter stripe, official PSG crest on chest, Nike Swoosh and Qatar Airways sponsor. ${ICON_BASE_STYLE}`,
  'paris saint germain':
    `A sleek, modern 3D icon of the Paris Saint-Germain PSG 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the midnight navy blue jersey shirt with red and white central hechter stripe, official PSG crest on chest, Nike Swoosh and Qatar Airways sponsor. ${ICON_BASE_STYLE}`,
  psg:
    `A sleek, modern 3D icon of the Paris Saint-Germain PSG 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the midnight navy blue jersey shirt with red and white central hechter stripe, official PSG crest on chest, Nike Swoosh and Qatar Airways sponsor. ${ICON_BASE_STYLE}`,
  'bayern munich':
    `A sleek, modern 3D icon of the Bayern Munich 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the deep all-red jersey shirt with subtle diamonds, official Bayern crest, Adidas stripes and T-Mobile sponsor. ${ICON_BASE_STYLE}`,
  'bayern munchen':
    `A sleek, modern 3D icon of the Bayern Munich 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the deep all-red jersey shirt, official Bayern crest, Adidas stripes. ${ICON_BASE_STYLE}`,
  'borussia dortmund':
    `A sleek, modern 3D icon of the Borussia Dortmund 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the electric signal-yellow jersey shirt with black stripes, BVB crest and 1&1 sponsor. ${ICON_BASE_STYLE}`,
  dortmund:
    `A sleek, modern 3D icon of the Borussia Dortmund 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the electric signal-yellow jersey shirt with black stripes, BVB crest. ${ICON_BASE_STYLE}`,
  juventus:
    `A sleek, modern 3D icon of the Juventus 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the classic black and white vertical zebra stripes jersey, official Juve crest on chest. ${ICON_BASE_STYLE}`,
  'inter milan':
    `A sleek, modern 3D icon of the Inter Milan 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the black and royal blue vertical stripes jersey, two gold stars and Inter crest on chest. ${ICON_BASE_STYLE}`,
  inter:
    `A sleek, modern 3D icon of the Inter Milan 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the black and royal blue vertical stripes jersey, two gold stars and Inter crest. ${ICON_BASE_STYLE}`,
  'ac milan':
    `A sleek, modern 3D icon of the AC Milan 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the red and black vertical rossoneri stripes jersey, AC Milan crest on chest. ${ICON_BASE_STYLE}`,
  milan:
    `A sleek, modern 3D icon of the AC Milan 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the red and black vertical rossoneri stripes jersey, AC Milan crest. ${ICON_BASE_STYLE}`,
  chelsea:
    `A sleek, modern 3D icon of the Chelsea FC 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the royal blue jersey shirt with metallic accents, Chelsea lion crest on chest. ${ICON_BASE_STYLE}`,
  tottenham:
    `A sleek, modern 3D icon of the Tottenham Hotspur 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the pure white jersey shirt with navy blue trim, Spurs cockerel crest on chest. ${ICON_BASE_STYLE}`,
  'manchester united':
    `A sleek, modern 3D icon of the Manchester United 2026-2027 official home football jersey shirt. Icon style, clean frontal view of the crimson red jersey shirt with white collar, Manchester United Red Devil crest on chest, Snapdragon sponsor. ${ICON_BASE_STYLE}`,

  // Baloncesto NBA
  'los angeles lakers':
    `A sleek, modern 3D icon of the Los Angeles Lakers 2026-2027 official gold and purple basketball jersey. Icon style, clean frontal view of the jersey with iconic LAKERS lettering and number, purple trim. ${ICON_BASE_STYLE}`,
  lakers:
    `A sleek, modern 3D icon of the Los Angeles Lakers 2026-2027 official gold and purple basketball jersey. Icon style, clean frontal view of the jersey with iconic LAKERS lettering and number, purple trim. ${ICON_BASE_STYLE}`,
  'boston celtics':
    `A sleek, modern 3D icon of the Boston Celtics 2026-2027 official green and white basketball jersey. Icon style, clean frontal view of the jersey with CELTICS lettering and number, white trim. ${ICON_BASE_STYLE}`,
  celtics:
    `A sleek, modern 3D icon of the Boston Celtics 2026-2027 official green and white basketball jersey. Icon style, clean frontal view of the jersey with CELTICS lettering and number, white trim. ${ICON_BASE_STYLE}`,
  'golden state warriors':
    `A sleek, modern 3D icon of the Golden State Warriors 2026-2027 official royal blue and California golden yellow basketball jersey uniform. Icon style, clean frontal view of the jersey with iconic San Francisco Bay Bridge circular logo, WARRIORS lettering, yellow trim. ${ICON_BASE_STYLE}`,
  warriors:
    `A sleek, modern 3D icon of the Golden State Warriors 2026-2027 official royal blue and California golden yellow basketball jersey uniform. Icon style, clean frontal view of the jersey with iconic San Francisco Bay Bridge circular logo, WARRIORS lettering, yellow trim. ${ICON_BASE_STYLE}`,
  'chicago bulls':
    `A sleek, modern 3D icon of the Chicago Bulls 2026-2027 official red and black basketball jersey. Icon style, clean frontal view of the jersey with iconic BULLS lettering and charging bull logo. ${ICON_BASE_STYLE}`,
  bulls:
    `A sleek, modern 3D icon of the Chicago Bulls 2026-2027 official red and black basketball jersey. Icon style, clean frontal view of the jersey with iconic BULLS lettering and charging bull logo. ${ICON_BASE_STYLE}`,
  'miami heat':
    `A sleek, modern 3D icon of the Miami Heat 2026-2027 official black and red basketball jersey. Icon style, clean frontal view of the jersey with HEAT lettering and flaming basketball logo. ${ICON_BASE_STYLE}`,
  heat:
    `A sleek, modern 3D icon of the Miami Heat 2026-2027 official black and red basketball jersey. Icon style, clean frontal view of the jersey with HEAT lettering and flaming basketball logo. ${ICON_BASE_STYLE}`,
};

function cleanStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Construye el prompt con la estética exacta de icono de app 3D */
function getKitPrompt(teamName: string, sport: string): string {
  const clean = cleanStr(teamName);

  if (TEAM_KIT_PROMPTS[clean]) return TEAM_KIT_PROMPTS[clean];

  for (const [key, prompt] of Object.entries(TEAM_KIT_PROMPTS)) {
    if (clean.includes(key) || key.includes(clean)) return prompt;
  }

  const sportTerm = sport === 'basketball' ? 'basketball jersey uniform' : 'football soccer jersey shirt';
  return `A sleek, modern 3D icon of the ${teamName} 2026-2027 official home ${sportTerm}. Icon style, clean frontal view of the jersey shirt, authentic team colors, club crest on chest. ${ICON_BASE_STYLE}`;
}

/** Llama a la API de Google Gemini (Imagen 3 o Gemini Flash multimodal) */
async function generateWithGemini(prompt: string, apiKey: string): Promise<Buffer> {
  let lastErrorDetail = '';

  // Intento 1: Imagen 3 (imagen-3.0-generate-002)
  try {
    const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(imagenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          outputMimeType: 'image/jpeg',
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        return Buffer.from(b64, 'base64');
      }
    } else {
      const errText = await res.text();
      lastErrorDetail = errText;
      console.warn('[Gemini Imagen 3 error]:', errText);
    }
  } catch (e: any) {
    lastErrorDetail = e.message || String(e);
  }

  // Intento 2: Gemini multimodal generateContent (gemini-2.0-flash-exp)
  try {
    const flashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(flashUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData && p.inlineData.data) {
          return Buffer.from(p.inlineData.data, 'base64');
        }
      }
    } else {
      const errText = await res.text();
      lastErrorDetail = errText;
      console.warn('[Gemini 2.0 Flash multimodal error]:', errText);
    }
  } catch (e: any) {
    lastErrorDetail = e.message || String(e);
  }

  let friendlyMsg = 'No se pudo generar la camiseta con la API de Google Gemini.';
  try {
    const parsed = JSON.parse(lastErrorDetail);
    if (parsed.error?.message) {
      friendlyMsg = `Error de Google Gemini: ${parsed.error.message}`;
    }
  } catch {
    if (lastErrorDetail) {
      friendlyMsg += ` (${lastErrorDetail.slice(0, 140)})`;
    }
  }

  throw new Error(`${friendlyMsg} Revisa tu clave de Google Gemini (AIza...) en aistudio.google.com.`);
}

export async function POST(req: Request) {
  let teamName = '';
  let sport = 'football';

  try {
    const body: GenerateKitRequest = await req.json();
    teamName = body.teamName || '';
    sport = body.sport || 'football';
    const rawKey =
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';
    const apiKey = typeof rawKey === 'string' ? rawKey.replace(/["'\s]/g, '') : '';

    if (!teamName) {
      return NextResponse.json({ success: false, error: 'teamName is required' }, { status: 400 });
    }

    if (sport === 'tennis') {
      return NextResponse.json({
        success: false,
        error: 'Tennis usa banderas de país, no camisetas.',
      });
    }

    const slug = slugify(teamName);
    const filename = `${slug}-kit.jpg`;
    const localUrl = `/images/kits/ai-generated/${filename}`;
    const fullPath = join(process.cwd(), 'public', 'images', 'kits', 'ai-generated', filename);

    // ── 1. Revisar si ya existe en caché local ──
    if (existsSync(fullPath)) {
      return NextResponse.json({ success: true, imageUrl: localUrl, cached: true });
    }

    // ── 2. Revisar si hay un icono pre-diseñado en /public/images/kits/ ──
    const preDesignedCandidates = [
      `${slug}-26-27.jpg`,
      `${slug}.jpg`,
      `${slug}-26-27.png`,
    ];
    for (const cand of preDesignedCandidates) {
      const candPath = join(process.cwd(), 'public', 'images', 'kits', cand);
      if (existsSync(candPath)) {
        return NextResponse.json({
          success: true,
          imageUrl: `/images/kits/${cand}`,
          cached: true,
        });
      }
    }

    // ── 3. Verificar que haya API Key de Gemini ──
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Para generar camisetas con IA se requiere la clave de Google Gemini. Por favor, introduce tu API key de Gemini en la parte superior o en .env.local (consíguela gratis en aistudio.google.com).',
        },
        { status: 400 }
      );
    }

    // ── 4. Generar directamente con Gemini ──
    const prompt = getKitPrompt(teamName, sport);
    const buffer = await generateWithGemini(prompt, apiKey);

    // Guardar en disco
    const outDir = join(process.cwd(), 'public', 'images', 'kits', 'ai-generated');
    await mkdir(outDir, { recursive: true });
    await writeFile(fullPath, buffer);

    return NextResponse.json({
      success: true,
      imageUrl: localUrl,
      provider: 'gemini',
      teamName,
    });
  } catch (error: any) {
    console.error('[generate-kit] Error generando con Gemini:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al generar la camiseta con Google Gemini.',
      },
      { status: 500 }
    );
  }
}
