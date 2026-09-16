// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Formats a number as currency (EUR by default)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats decimal odds to 2 decimal places with 'x' suffix
 * e.g. 2.5 → "2.50x"
 */
export function formatOdds(odds: number): string {
  return `${odds.toFixed(2)}x`;
}

/**
 * Formats a date string to a readable local date
 */
export function formatDate(dateString: string, locale: string = 'es-ES'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a date string to a readable local date + time
 */
export function formatDateTime(dateString: string, locale: string = 'es-ES'): string {
  return new Date(dateString).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns relative time string (e.g. "hace 3 horas")
 */
export function formatRelativeTime(dateString: string, locale: string = 'es-ES'): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days > 0)    return rtf.format(-days, 'day');
  if (hours > 0)   return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

/**
 * Formats a win rate percentage
 * e.g. 0.653 → "65.3%"
 */
export function formatWinRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Truncates text to a max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
