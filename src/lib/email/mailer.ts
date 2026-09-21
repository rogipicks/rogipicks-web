/**
 * Envío del aviso de contacto por correo electrónico (SMTP con nodemailer).
 *
 * Configuración (en .env.local):
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_USER=rogipicks@gmail.com
 *   SMTP_PASS=<contraseña de aplicación de Google>   ← NO es la contraseña normal
 *
 * Si no hay credenciales, el aviso se omite en silencio: el mensaje ya queda
 * guardado en la base de datos y el formulario responde "enviado" igualmente.
 */

import nodemailer from 'nodemailer';
import { APP_CONFIG } from '@/constants/config';
import { contactTopicLabel, type ContactMessage } from '@/types/contactMessage';

/** ¿Hay credenciales SMTP configuradas para poder enviar correos? */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function buildTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port,
    // 465 usa TLS implícito; el resto (p. ej. 587) arranca en claro y negocia STARTTLS
    secure: port === 465,
    auth: { user, pass },
  });
}

/** Versión de solo texto del aviso (clientes de correo sin HTML). */
function buildText(message: ContactMessage): string {
  return [
    'Nuevo mensaje recibido desde el formulario de contacto de RogiPicks.',
    '',
    `De:       ${message.name} <${message.email}>`,
    `Asunto:   ${contactTopicLabel(message.topic)}`,
    `Fecha:    ${new Date(message.createdAt).toLocaleString('es-ES')}`,
    '',
    '─'.repeat(60),
    '',
    message.message,
    '',
    '─'.repeat(60),
    '',
    `Puedes responder directamente a este correo: llegará a ${message.email}.`,
    `ID del mensaje: ${message.id}`,
  ].join('\n');
}

/** Versión HTML del aviso, con el estilo oscuro de la marca. */
function buildHtml(message: ContactMessage): string {
  const escape = (value: string): string =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#0d1117;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#161b22;border:1px solid #2d333b;border-radius:12px;overflow:hidden;">
      <div style="background:#1c2333;padding:18px 24px;border-bottom:1px solid #2d333b;">
        <span style="font-size:18px;font-weight:bold;color:#ffffff;">📩 Nuevo mensaje en RogiPicks</span>
      </div>
      <div style="padding:24px;color:#e6edf3;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 6px;"><strong style="color:#8b949e;">De:</strong> ${escape(message.name)} &lt;${escape(message.email)}&gt;</p>
        <p style="margin:0 0 6px;"><strong style="color:#8b949e;">Asunto:</strong> ${escape(contactTopicLabel(message.topic))}</p>
        <p style="margin:0 0 18px;"><strong style="color:#8b949e;">Fecha:</strong> ${escape(new Date(message.createdAt).toLocaleString('es-ES'))}</p>
        <div style="background:#0d1117;border:1px solid #2d333b;border-radius:8px;padding:16px;white-space:pre-wrap;">${escape(message.message)}</div>
        <p style="margin:18px 0 0;color:#8b949e;font-size:12px;">
          Responde a este correo para contactar directamente con ${escape(message.email)}.<br />
          ID del mensaje: ${escape(message.id)}
        </p>
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Envía el aviso del nuevo mensaje a APP_CONFIG.contactEmail (rogipicks@gmail.com).
 * Devuelve `true` si el correo salió, `false` si se omitió o falló.
 * Nunca lanza: el mensaje ya está guardado y el envío es un extra.
 */
export async function sendContactNotification(message: ContactMessage): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(
      '[contacto] SMTP sin configurar (SMTP_USER/SMTP_PASS): el aviso por correo se omite.'
    );
    return false;
  }

  const transport = buildTransport();
  if (!transport) return false;

  const subject = `[RogiPicks] ${contactTopicLabel(message.topic)} — ${message.name}`;

  try {
    await transport.sendMail({
      from: `"RogiPicks Web" <${process.env.SMTP_USER}>`,
      to: APP_CONFIG.contactEmail,
      replyTo: `"${message.name}" <${message.email}>`,
      subject,
      text: buildText(message),
      html: buildHtml(message),
    });

    console.info(`[contacto] Aviso por correo enviado a ${APP_CONFIG.contactEmail}`);
    return true;
  } catch (error) {
    console.error('[contacto] Error al enviar el aviso por correo:', error);
    return false;
  }
}