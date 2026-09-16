// ─── Odds & Probability Utilities ─────────────────────────────────────────────

/**
 * Converts decimal odds to implied probability (percentage)
 * e.g. odds 2.0 → 50%
 */
export function oddsToImpliedProbability(odds: number): number {
  return parseFloat(((1 / odds) * 100).toFixed(2));
}

/**
 * Converts American moneyline odds to decimal odds
 * e.g. +150 → 2.5 | -200 → 1.5
 */
export function americanToDecimal(american: number): number {
  if (american > 0) return parseFloat((american / 100 + 1).toFixed(3));
  return parseFloat((100 / Math.abs(american) + 1).toFixed(3));
}

/**
 * Calculates the potential return for a bet
 * e.g. stake 10, odds 2.5 → 25
 */
export function calculateReturn(stake: number, odds: number): number {
  return parseFloat((stake * odds).toFixed(2));
}

/**
 * Calculates the net profit for a bet
 * e.g. stake 10, odds 2.5 → 15 profit
 */
export function calculateProfit(stake: number, odds: number): number {
  return parseFloat((stake * odds - stake).toFixed(2));
}

/**
 * Calculates the Kelly Criterion stake percentage
 * Useful for bankroll management recommendations
 */
export function kellyCriterion(odds: number, probability: number): number {
  const q = 1 - probability;
  const b = odds - 1;
  return parseFloat(((b * probability - q) / b).toFixed(4));
}

/**
 * Returns an odds color class based on value
 * High odds = risky (red), low odds = favourite (green)
 */
export function getOddsColor(odds: number): 'odds-low' | 'odds-mid' | 'odds-high' {
  if (odds < 1.5) return 'odds-low';
  if (odds < 3.0) return 'odds-mid';
  return 'odds-high';
}
