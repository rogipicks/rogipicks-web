import type { Pick, PickResult } from '@/types/pick';
import { MOCK_PICKS } from '@/lib/data/mockPicks';

export const PICKS_STORAGE_KEY = 'rogipicks_admin_picks';
const CHANNEL_NAME = 'rogipicks_sync_channel';

/**
 * Obtiene los picks locales guardados en localStorage con fallback a MOCK_PICKS
 */
export function getLocalPicks(): Pick[] {
  if (typeof window === 'undefined') return MOCK_PICKS;
  try {
    const raw = localStorage.getItem(PICKS_STORAGE_KEY);
    if (!raw) return MOCK_PICKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PICKS;
  } catch {
    return MOCK_PICKS;
  }
}

/**
 * Guarda los picks en localStorage y emite un evento instantáneo
 * tanto para la misma pestaña como para otras pestañas abiertas (BroadcastChannel).
 */
export function saveLocalPicks(picks: Pick[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PICKS_STORAGE_KEY, JSON.stringify(picks));

    // Notificar a otras pestañas mediante BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ type: 'PICKS_UPDATED', picks });
        channel.close();
      } catch {}
    }

    // Notificar a componentes en la misma pestaña
    window.dispatchEvent(new CustomEvent('rogipicks_picks_updated', { detail: picks }));
  } catch (err) {
    console.error('Error saving picks to localStorage:', err);
  }
}

/**
 * Suscribe un componente para que reaccione automáticamente a cualquier
 * cambio de picks o resultados en tiempo real (mismo navegador o entre pestañas).
 */
export function subscribeToPicks(callback: (picks: Pick[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === 'PICKS_UPDATED' && Array.isArray(event.data.picks)) {
          callback(event.data.picks);
        }
      };
    } catch {}
  }

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<Pick[]>;
    if (Array.isArray(custom.detail)) {
      callback(custom.detail);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === PICKS_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          callback(parsed);
        }
      } catch {}
    }
  };

  window.addEventListener('rogipicks_picks_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  return () => {
    try {
      channel?.close();
    } catch {}
    window.removeEventListener('rogipicks_picks_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
  };
}
