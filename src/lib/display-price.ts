import type { DisplayCurrency } from '@/types/display-currency';
import { formatUsd, usdToPen } from '@/lib/utils';

export function getDisplayPriceVisibility(displayCurrency: DisplayCurrency) {
  return {
    showUsd: displayCurrency !== 'PEN',
    showPen: displayCurrency !== 'USD',
  };
}

export function formatPenInteger(pen: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(pen);
}

export function discountedUsdPrice(usd: number, discountPercent: number): number {
  return Math.round(usd * (1 - discountPercent / 100) * 100) / 100;
}

export function discountedPenPrice(usd: number, discountPercent: number): number {
  return Math.round(usdToPen(usd) * (1 - discountPercent / 100));
}

/** Precio unitario con descuento por volumen según moneda activa. */
export function formatVolumeUnitPrice(
  unitPriceUsd: number,
  discountPercent: number,
  displayCurrency: DisplayCurrency,
): string {
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const parts: string[] = [];

  if (showUsd) {
    parts.push(formatUsd(discountedUsdPrice(unitPriceUsd, discountPercent)));
  }
  if (showPen) {
    parts.push(formatPenInteger(discountedPenPrice(unitPriceUsd, discountPercent)));
  }

  return parts.join(' · ');
}
