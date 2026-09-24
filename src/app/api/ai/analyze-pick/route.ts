import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AnalyzeRequest {
  homeTeam: string;
  awayTeam: string;
  competition?: string;
  selection: string;
  odds?: number | string;
  sport?: string;
  confidence?: number;
  apiKey?: string;
}

/**
 * Genera análisis inteligente y profesional de apuestas con Groq (groq.com)
 * o generador deportivo experto integrado si no hay clave configurada.
 */
export async function POST(req: Request) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { homeTeam, awayTeam, competition, selection, odds, sport, confidence, apiKey } = body;

    if (!homeTeam || !awayTeam || !selection) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios (local, visitante o selección).' },
        { status: 400 }
      );
    }

    const groqKey =
      apiKey?.trim() ||
      process.env.GROQ_API_KEY?.trim() ||
      process.env.GROK_API_KEY?.trim() ||
      process.env.XAI_API_KEY?.trim() ||
      '';

    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `Eres el tipster profesional y analista de apuestas de RogiPicks (rogipicks.es).
Tu objetivo es redactar un análisis deportivo realista, convincente, cercano y con criterio real de campo. CERO tono corporativo, CERO relleno artificial y CERO formalismos aburridos.

NORMAS CRÍTICAS QUE DEBES CUMPLIR:
1. PROHIBIDO NOMBRAR EL PARTIDO AL INICIO: No uses fórmulas como "Partido entre...", "Duelo entre...", "En este encuentro...", "Enfrentamiento de...", "Choque entre...".
2. EMPIEZA DIRECTAMENTE HABLANDO DE LA APUESTA: La primera frase debe ir directa al grano basándose en el nombre de la apuesta ("${selection}") y justificando por qué esa cuota (${odds ? `${odds}x` : 'propuesta'}) tiene un valor clarísimo (ejemplos: "Buscamos el [nombre apuesta] porque...", "Esta línea de [nombre apuesta] se queda corta viendo cómo...", "Entramos con fuerza a [nombre apuesta] convencidos de que...").
3. TONO DE TIPSTER EXPERTO Y CERCANO: Escribe como un tipster real hablando a su comunidad de apostadores ("Vamos con...", "Las bookies están desajustadas aquí...", "La lectura es clara...", "Tiene un valor tremendo"). Natural, seguro y en español de España.
4. ANÁLISIS DETALLADO DE AMBAS PARTES CON DATOS REALISTAS:
   - Analiza a ${homeTeam}: su momento de forma actual, registros recientes (media de goles/puntos, racha, virtudes en ataque y lagunas defensivas).
   - Analiza a ${awayTeam}: cómo encaja en este choque, su rendimiento reciente fuera de casa, debilidades que favorecen nuestra apuesta.
   - Contraste táctico: demuestra con dinámicas de juego por qué el choque de ambos hace que la apuesta "${selection}" sea la opción lógica.
5. PROYECCIÓN DE RESULTADOS REALES: Menciona escenarios de partido tangibles y marcadores o desarrollos probables (por ejemplo marcadores realistas tipo 2-1 o 3-1, partidos de ida y vuelta, o sets ajustados 7-5 / 6-4).
6. FORMATO: Unos 120-160 palabras divididas en 2 párrafos fluidos y directos. Sin viñetas, sin encabezados como 'Análisis:', sin saludos ni despedidas.`,
              },
              {
                role: 'user',
                content: `Genera el pronóstico y justificación detallada para esta apuesta:
- Selección / Apuesta: ${selection}
- Cuota: ${odds ? `${odds}x` : 'mercado actual'}
- Local / Jugador 1: ${homeTeam}
- Visitante / Jugador 2: ${awayTeam}
- Competición: ${competition || 'Competición oficial'}
- Nivel de confianza: ${confidence ?? 3}/5 estrellas

Recuerda: Arranca directamente desde la apuesta "${selection}", analiza a ambos equipos/jugadores con datos y resultados reales, y mantén el tono cercano y convincente de tipster.`,
              },
            ],
            temperature: 0.68,
            max_tokens: 450,
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const analysis = data?.choices?.[0]?.message?.content?.trim();
          if (analysis) {
            return NextResponse.json({ success: true, analysis, provider: 'groq' });
          }
        } else {
          // Si el modelo principal no responde o tiene rate-limit, probar con modelo rápido 8b
          const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                  content:
                    'Eres tipster de RogiPicks. Tono cercano, directo y experto (cero formal). PROHIBIDO empezar nombrando el partido ("Duelo entre...", "Partido..."). Empieza directamente justificando la apuesta ("Buscamos...", "Entramos a..."), analiza a fondo a ambos equipos con datos y resultados reales y da un marcador probable. 120-140 palabras en 2 párrafos, sin encabezados.',
                },
                {
                  role: 'user',
                  content: `Apuesta: ${selection}. Cuota: ${odds}. Local: ${homeTeam}. Visitante: ${awayTeam}. Competición: ${competition}. Confianza: ${confidence}/5. Justifica empezando por la apuesta y analizando a ambos lados.`,
                },
              ],
              temperature: 0.68,
              max_tokens: 380,
            }),
          });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            const analysis = fbData?.choices?.[0]?.message?.content?.trim();
            if (analysis) {
              return NextResponse.json({ success: true, analysis, provider: 'groq-fast' });
            }
          }
        }
      } catch (err) {
        console.error('Error llamando a la API de Groq:', err);
      }
    }

    // Generador deportivo experto de respaldo en caso de que aún no haya clave
    const fallbackAnalysis = generateSmartAnalysis({
      homeTeam,
      awayTeam,
      competition,
      selection,
      odds,
      sport,
      confidence,
    });

    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      provider: 'built-in-expert',
      note: groqKey ? undefined : 'Clave de Groq no configurada; generado con el modelo deportivo integrado.',
    });
  } catch (error) {
    console.error('Error en /api/ai/analyze-pick:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando la solicitud de análisis.' },
      { status: 500 }
    );
  }
}

function generateSmartAnalysis({
  homeTeam,
  awayTeam,
  competition,
  selection,
  odds,
  sport,
  confidence,
}: {
  homeTeam: string;
  awayTeam: string;
  competition?: string;
  selection: string;
  odds?: number | string;
  sport?: string;
  confidence?: number;
}): string {
  const compStr = competition ? ` en ${competition}` : '';
  const oddsStr = odds ? ` a cuota ${odds}` : '';
  const selLower = selection.toLowerCase();

  // Tenis
  if (
    selLower.includes('set') ||
    selLower.includes('juego') ||
    sport === 'tennis' ||
    compStr.toLowerCase().includes('atp') ||
    compStr.toLowerCase().includes('wta')
  ) {
    if (selLower.includes('más') || selLower.includes('+') || selLower.includes('over')) {
      return `Buscamos '${selection}'${oddsStr} porque las casas están subestimando la paridad que hay en la pista. ${homeTeam} viene mostrando una efectividad brutal con su primer servicio (por encima del 75% de puntos ganados) y comete poquísimos errores no forzados con su derecha. Por su parte, ${awayTeam} es un jugador que no regala nada al resto, sabe alargar los intercambios desde el fondo y rara vez cede quiebres con facilidad en los primeros compases.\n\nCon dos jugadores tan sólidos con el saque, el guión más probable nos lleva a mangas muy disputadas que perfectamente se resolverán en tie-breaks o con marcadores tipo 7-5 o 6-4. Esperamos un partido largo y tenso donde superar esta línea de juegos o sets es la lectura más inteligente de la jornada.`;
    }
    if (selLower.includes('hándicap') || selLower.includes('handicap')) {
      return `Entramos a '${selection}'${oddsStr} convencidos de la clara superioridad de ritmo que va a imponer ${homeTeam}. Llega en una dinámica física excelente, restando con muchísima profundidad y castigando el segundo saque de sus rivales. Por contra, ${awayTeam} viene sufriendo bastante en pistas rápidas, dejando bolas cortas a media pista y sufriendo mucho desgaste cuando el peloteo pasa de cuatro golpes.\n\n${homeTeam} debería llevar la iniciativa en todo momento y marcar distancias desde el inicio. Con un marcador estimado de 6-3 o 6-4 a favor, el hándicap propuesto tiene un margen de seguridad sobresaliente para sumar un verde con solvencia.`;
    }
    return `Vamos directos con '${selection}'${oddsStr} aprovechando una cuota que nos deja un valor tremendo. ${homeTeam} llega con la confianza por las nubes tras encadenar buenas sensaciones en sus últimos torneos, dictando el juego desde la línea de fondo. Mientras tanto, ${awayTeam} suele sufrir desconexiones en los momentos de presión y le cuesta sostener ventajas cuando el rival le cambia las alturas.\n\nEl plan de partido favorece claramente nuestra elección. Proyectamos un choque dominado en los compases clave para sacar adelante la victoria con bastante solvencia y llevarnos el pronóstico.`;
  }

  // Fútbol - Goles / Ambos Marcan
  if (selLower.includes('gol') || selLower.includes('ambos') || sport === 'football') {
    if (selLower.includes('más') || selLower.includes('+') || selLower.includes('over') || selLower.includes('ambos')) {
      return `Vamos de cabeza con '${selection}'${oddsStr} porque los números y las propuestas de ambos equipos apuntan directamente a un festival de ocasiones. ${homeTeam} promedia más de 1.8 goles por partido en casa, atacando con mucha verticalidad y laterales volcados, pero suele dejar desprotegida la espalda de sus centrales. Justo ahí es donde ${awayTeam} hace daño: son letales al contraataque, promedian más de 4 remates a puerta por salida y vienen de ver puerta en 4 de sus últimos 5 desplazamientos.\n\nNinguno de los dos especula ni sabe encerrarse atrás. El escenario más probable es un choque abierto de ida y vuelta con un marcador tipo 2-1 o 3-1, lo que hace que esta cuota sea una auténtica oportunidad de valor para entrar con total confianza.`;
    }
    return `Nos decantamos por '${selection}'${oddsStr} porque la diferencia de momento y contundencia entre ambos es más que evidente. ${homeTeam} viene de ganar 3 de sus últimos 4 partidos, encajando apenas un gol y dominando la posesión en campo rival. Por el contrario, ${awayTeam} llega con dudas en la salida de balón, promediando más de 12 pérdidas en campo propio y con problemas graves para defender el balón parado.\n\nEsperamos que ${homeTeam} controle el ritmo desde el pitido inicial y traduzca su dominio territorial en el marcador, con un resultado esperado de 2-0 o 3-0 que nos daría el verde sin sobresaltos.`;
  }

  // General / Otros deportes
  return `Entramos a '${selection}'${oddsStr} porque la línea está claramente desajustada respecto al rendimiento que vienen ofreciendo ambos. ${homeTeam} llega en plena racha positiva, con una intensidad defensiva muy alta y una efectividad en ataque que está destrozando las previsiones. Por otro lado, ${awayTeam} está acusando el cansancio y cometiendo pérdidas infantiles que ante un rival enchufado se pagan caras.\n\nLa dinámica del choque nos pone el viento a favor desde el minuto uno. Vemos un desarrollo donde el favoritismo real se impondrá con claridad en el marcador para cerrar una de las mejores entradas del día.`;
}
