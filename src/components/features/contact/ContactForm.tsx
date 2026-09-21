'use client';

import { useState } from 'react';
import { CONTACT_LIMITS, CONTACT_TOPICS, type ContactTopic } from '@/types/contactMessage';
import styles from './ContactForm.module.css';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

interface FormState {
  name: string;
  email: string;
  topic: ContactTopic | '';
  message: string;
  consent: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  topic: '',
  message: '',
  consent: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);
  // Honeypot: nunca debe llevar texto; solo lo rellenan los bots.
  const [honeypot, setHoneypot] = useState('');

  const isSending = status === 'sending';

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errorField === key) {
      setErrorField(null);
      setErrorMessage('');
      setStatus('idle');
    }
  }

  /** Validación en el navegador: la misma que repite el servidor. */
  function validate(): { field: string; message: string } | null {
    const name = form.name.trim();
    if (name.length < CONTACT_LIMITS.NAME_MIN) {
      return { field: 'name', message: 'Escribe tu nombre (mínimo 2 caracteres).' };
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      return { field: 'email', message: 'Revisa el correo electrónico: parece que falta algo.' };
    }
    if (!form.topic) {
      return { field: 'topic', message: 'Elige un asunto para tu mensaje.' };
    }
    if (form.message.trim().length < CONTACT_LIMITS.MESSAGE_MIN) {
      return {
        field: 'message',
        message: `Cuéntanos un poco más (mínimo ${CONTACT_LIMITS.MESSAGE_MIN} caracteres).`,
      };
    }
    if (!form.consent) {
      return {
        field: 'consent',
        message: 'Debes aceptar la política de privacidad para poder escribirnos.',
      };
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;

    const invalid = validate();
    if (invalid) {
      setErrorField(invalid.field);
      setErrorMessage(invalid.message);
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorField(null);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          topic: form.topic,
          message: form.message.trim(),
          consent: form.consent,
          website: honeypot,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | { success?: boolean; error?: string; field?: string }
        | null;

      if (!res.ok || !json?.success) {
        setErrorField(json?.field ?? null);
        setErrorMessage(
          json?.error ?? 'No hemos podido enviar tu mensaje. Inténtalo de nuevo en un rato.'
        );
        setStatus('error');
        return;
      }

      setForm(EMPTY_FORM);
      setHoneypot('');
      setStatus('success');
    } catch {
      setErrorMessage(
        'No hemos podido conectar con el servidor. Revisa tu conexión e inténtalo otra vez.'
      );
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successCard} role="status" aria-live="polite">
        <span className={styles.successIcon} aria-hidden="true">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className={styles.successTitle}>¡Mensaje enviado!</h2>
        <p className={styles.successText}>
          Lo hemos recibido correctamente. Te responderemos al correo que nos has dejado lo antes
          posible, normalmente en menos de 48 horas.
        </p>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setStatus('idle');
            setErrorMessage('');
            setErrorField(null);
          }}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {status === 'error' && errorMessage && (
        <div className={styles.errorBanner} role="alert" aria-live="assertive">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-name">
            Tu nombre
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className={`${styles.input} ${errorField === 'name' ? styles.inputError : ''}`}
            placeholder="Cómo te llamas"
            value={form.name}
            maxLength={CONTACT_LIMITS.NAME_MAX}
            autoComplete="name"
            onChange={(event) => update('name', event.target.value)}
            disabled={isSending}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-email">
            Tu correo electrónico
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className={`${styles.input} ${errorField === 'email' ? styles.inputError : ''}`}
            placeholder="tucorreo@ejemplo.com"
            value={form.email}
            maxLength={120}
            autoComplete="email"
            onChange={(event) => update('email', event.target.value)}
            disabled={isSending}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-topic">
          ¿Sobre qué quieres hablarnos?
        </label>
        <select
          id="contact-topic"
          name="topic"
          className={`${styles.select} ${errorField === 'topic' ? styles.inputError : ''}`}
          value={form.topic}
          onChange={(event) => update('topic', event.target.value as ContactTopic)}
          disabled={isSending}
        >
          <option value="">Elige un asunto…</option>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor="contact-message">
            Tu mensaje
          </label>
          <span
            className={`${styles.counter} ${
              form.message.length > CONTACT_LIMITS.MESSAGE_MAX ? styles.counterOver : ''
            }`}
          >
            {form.message.length}/{CONTACT_LIMITS.MESSAGE_MAX}
          </span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          rows={7}
          className={`${styles.textarea} ${errorField === 'message' ? styles.inputError : ''}`}
          placeholder="Cuéntanos tu duda con el detalle que puedas: partido, pronóstico o lo que necesites."
          value={form.message}
          maxLength={CONTACT_LIMITS.MESSAGE_MAX}
          onChange={(event) => update('message', event.target.value)}
          disabled={isSending}
        />
      </div>

      <label className={`${styles.consent} ${errorField === 'consent' ? styles.consentError : ''}`}>
        <input
          type="checkbox"
          name="consent"
          className={styles.checkbox}
          checked={form.consent}
          onChange={(event) => update('consent', event.target.checked)}
          disabled={isSending}
        />
        <span>
          He leído y acepto la{' '}
          <a href="/politica-de-privacidad" className={styles.consentLink}>
            política de privacidad
          </a>
          . Tus datos se usan solo para responderte.
        </span>
      </label>

      {/* Honeypot anti-spam: oculto para las personas, visible para los bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">No rellenes este campo</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <button type="submit" className={styles.submit} disabled={isSending}>
        {isSending ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Enviando…
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            Enviar mensaje
          </>
        )}
      </button>

      <p className={styles.note}>
        Respondemos todos los mensajes reales. Si tu consulta es sobre protección de datos, indícalo
        en el asunto para que llegue a la persona responsable.
      </p>
    </form>
  );
}