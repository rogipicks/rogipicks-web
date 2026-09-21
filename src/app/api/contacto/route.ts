import { NextResponse } from 'next/server';
import { createMessage } from '@/lib/db/messagesDb';
import { sendContactNotification } from '@/lib/email/mailer';
import {
  CONTACT_LIMITS,
  CONTACT_TOPIC_VALUES,
  type ContactMessage,
  type ContactTopic,
} from '@/types/contactMessage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Validación de correo: suficiente para descartar erratas evidentes. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// ─── Control de spam en memoria: máximo 5 envíos por IP cada 10 minutos ──────

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateHits.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX) {
    rateHits.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateHits.set(ip, recent);

  // Limpieza periódica para que el mapa no crezca sin control
  if (rateHits.size > 500) {
    for (const [key, times] of rateHits) {
      if (times.every((time) => now - time > RATE_WINDOW_MS)) rateHits.delete(key);
    }
  }

  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'desconocida';
}

/** Recorta a `max + 1` para poder detectar el exceso sin guardar cargas enormes. */
function readText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max + 1) : '';
}

function badRequest(error: string, field?: string) {
  return NextResponse.json({ success: false, error, field }, { status: 400 });
}

/**
 * Aviso opcional por Telegram al canal privado del equipo.
 * Solo se envía si están configurados TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID;
 * si no, se omite en silencio (el mensaje ya queda guardado en la base de datos).
 */
async function notifyTelegram(message: ContactMessage): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    '📩 Nuevo mensaje en RogiPicks',
    `De: ${message.name} <${message.email}>`,
    `Asunto: ${message.topic}`,
    '',
    message.message,
  ].join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (error) {
    // El aviso es un extra: si falla, el mensaje ya está guardado
    console.error('Error al avisar por Telegram:', error);
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('No hemos podido leer el formulario. Vuelve a intentarlo.');
    }

    const data = (body ?? {}) as Record<string, unknown>;

    // Honeypot: los bots rellenan este campo oculto. Respondemos "ok" sin guardar
    // nada para no darles pistas sobre el filtro.
    if (readText(data.website, 100)) {
      return NextResponse.json({ success: true, data: { id: null } }, { status: 201 });
    }

    const ip = clientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Has enviado varios mensajes seguidos. Espera unos minutos o escríbenos por correo electrónico.',
        },
        { status: 429 }
      );
    }

    const name = readText(data.name, CONTACT_LIMITS.NAME_MAX);
    const email = readText(data.email, 120).toLowerCase();
    const topic = readText(data.topic, 40);
    const message = readText(data.message, CONTACT_LIMITS.MESSAGE_MAX);
    const consent = data.consent === true;

    if (name.length < CONTACT_LIMITS.NAME_MIN) {
      return badRequest('Escribe tu nombre (mínimo 2 caracteres).', 'name');
    }
    if (name.length > CONTACT_LIMITS.NAME_MAX) {
      return badRequest('El nombre es demasiado largo.', 'name');
    }
    if (!EMAIL_RE.test(email)) {
      return badRequest('Revisa el correo electrónico: parece que falta algo.', 'email');
    }
    if (!CONTACT_TOPIC_VALUES.includes(topic)) {
      return badRequest('Elige un asunto para tu mensaje.', 'topic');
    }
    if (message.length < CONTACT_LIMITS.MESSAGE_MIN) {
      return badRequest(
        `Cuéntanos un poco más (mínimo ${CONTACT_LIMITS.MESSAGE_MIN} caracteres).`,
        'message'
      );
    }
    if (message.length > CONTACT_LIMITS.MESSAGE_MAX) {
      return badRequest(
        `El mensaje es demasiado largo (máximo ${CONTACT_LIMITS.MESSAGE_MAX} caracteres).`,
        'message'
      );
    }
    if (!consent) {
      return badRequest('Debes aceptar la política de privacidad para poder escribirnos.', 'consent');
    }

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      email,
      topic: topic as ContactTopic,
      message,
      createdAt: new Date().toISOString(),
      status: 'nuevo',
      meta: {
        userAgent: request.headers.get('user-agent')?.slice(0, 200) ?? undefined,
        ip,
      },
    };

    await createMessage(newMessage);
    console.info(`[contacto] Mensaje guardado: ${newMessage.id} (${newMessage.topic})`);

    // Avisos "best effort": si alguno falla, el mensaje ya está guardado
    await sendContactNotification(newMessage);
    await notifyTelegram(newMessage);

    // No devolvemos el contenido del mensaje: solo confirmamos el envío.
    return NextResponse.json({ success: true, data: { id: newMessage.id } }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/contacto:', error);
    return NextResponse.json(
      { success: false, error: 'No hemos podido guardar tu mensaje. Inténtalo de nuevo en un rato.' },
      { status: 500 }
    );
  }
}