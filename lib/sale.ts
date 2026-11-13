import { useSyncExternalStore } from 'react';

/**
 * Black Friday sale: one price from the early-bird start through Cyber
 * Monday, switched on and off by date so a single app build covers it and
 * no update is needed to end it.
 *
 * The app only changes what's DISPLAYED. The charge comes from the store
 * product the sale button buys (app.sonobuddy.unlock.share), so its price
 * must be scheduled to match in App Store Connect and Play Console for the
 * same dates: $4.99 from SALE_START, back to $6.99 at SALE_END.
 *
 * Dates are the device's local midnight.
 */
export const SALE_START = new Date(2026, 10, 13); // Fri Nov 13, 2026 (early bird)
export const BLACK_FRIDAY = new Date(2026, 10, 27); // Fri Nov 27
export const CYBER_MONDAY = new Date(2026, 10, 30); // Mon Nov 30
export const SALE_END = new Date(2026, 11, 1); // Tue Dec 1 (exclusive)

export const FULL_PRICE = 9.99;
export const REGULAR_SALE_PRICE = 6.99;
export const BLACK_FRIDAY_PRICE = 4.99;

/** ISO day strings for the analytics dashboard, which buckets by day. */
export const SALE_START_DAY = '2026-11-13';
export const SALE_LAST_DAY = '2026-11-30';

export interface Sale {
  /** Shown price for the discounted unlock, e.g. "$4.99". */
  price: string;
  /** Dollars off the $9.99 full price, e.g. "$5". */
  savings: string;
  /** Black Friday details, or null outside the event (regular $6.99 sale). */
  event: { badge: string; percentOff: number; endsLabel: string } | null;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;
const dollarsOff = (n: number) => `$${Math.round(FULL_PRICE - n)}`;

const REGULAR: Sale = { price: fmt(REGULAR_SALE_PRICE), savings: dollarsOff(REGULAR_SALE_PRICE), event: null };

function endsLabel(now: Date): string {
  const msLeft = SALE_END.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / 86_400_000);
  if (daysLeft <= 1) return 'Ends tonight';
  if (daysLeft === 2) return 'Ends tomorrow';
  return `Ends Mon, Nov 30 · ${daysLeft} days left`;
}

export function getSale(now: Date = new Date()): Sale {
  if (now < SALE_START || now >= SALE_END) return REGULAR;
  const badge = now >= CYBER_MONDAY
    ? 'Cyber Monday · last day'
    : now >= BLACK_FRIDAY
      ? 'Black Friday sale'
      : 'Early Black Friday';
  return {
    price: fmt(BLACK_FRIDAY_PRICE),
    savings: dollarsOff(BLACK_FRIDAY_PRICE),
    event: {
      badge,
      percentOff: Math.round((1 - BLACK_FRIDAY_PRICE / FULL_PRICE) * 100),
      endsLabel: endsLabel(now),
    },
  };
}

/** Price per discounted sale on a given analytics day ("YYYY-MM-DD"). */
export function salePriceOn(day: string): number {
  return day >= SALE_START_DAY && day <= SALE_LAST_DAY ? BLACK_FRIDAY_PRICE : REGULAR_SALE_PRICE;
}

// Cached so useSyncExternalStore gets a stable snapshot between renders.
let cached: { key: string; sale: Sale } | null = null;
function snapshot(): Sale {
  const sale = getSale();
  const key = JSON.stringify(sale);
  if (!cached || cached.key !== key) cached = { key, sale };
  return cached.sale;
}
const noop = () => () => {};

/** The current sale. Prerendered HTML always gets the regular price. */
export function useSale(): Sale {
  return useSyncExternalStore(noop, snapshot, () => REGULAR);
}
