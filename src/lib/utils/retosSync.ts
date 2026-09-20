import type { Reto } from '@/types/reto';

const STORAGE_KEY = 'rogipicks_retos_cache';
const CHANNEL_NAME = 'rogipicks_retos_channel';
const CUSTOM_EVENT_NAME = 'rogipicks_retos_sync';

export function getLocalRetos(): Reto[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocalRetos(retos: Reto[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(retos));

    // Emitir custom event en la misma ventana
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: retos }));

    // Emitir por BroadcastChannel a otras pestañas
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'RETOS_UPDATED', data: retos });
      channel.close();
    }
  } catch (err) {
    console.error('Error saving local retos:', err);
  }
}

export function subscribeToRetos(callback: (retos: Reto[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<Reto[]>;
    if (custom.detail && Array.isArray(custom.detail)) {
      callback(custom.detail);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) callback(parsed);
      } catch {}
    }
  };

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'RETOS_UPDATED' && Array.isArray(ev.data.data)) {
        callback(ev.data.data);
      }
    };
  }

  window.addEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (bc) bc.close();
  };
}
