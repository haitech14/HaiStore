import type { DisplayCurrency } from '@/types/display-currency';

const STORAGE_KEY = 'haistore-display-currency';

export function readDisplayCurrency(): DisplayCurrency {
  if (typeof window === 'undefined') return 'USD';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'PEN' ? 'PEN' : 'USD';
}

export function writeDisplayCurrency(currency: DisplayCurrency): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, currency);
}
