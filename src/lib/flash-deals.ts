import type { FeaturedProduct } from '@/data/featured-products';
import {
  catalogRowToFeatured,
  getCatalogRows,
  type CatalogRow,
} from '@/lib/catalog-featured';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import type { Product } from '@/types/product';

function discountPercent(row: CatalogRow): number {
  const compareAt = row.compare_at_price_usd;
  if (compareAt == null || compareAt <= row.prices.public) return 0;
  return Math.round((1 - row.prices.public / compareAt) * 100);
}

/** Productos del catálogo con precio tachado (compare_at > precio público). */
export function getFlashDealProducts(limit = 8): FeaturedProduct[] {
  return getCatalogRows()
    .filter((row) => discountPercent(row) > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a))
    .slice(0, limit)
    .map((row) => catalogRowToFeatured(row));
}

/** Combina ofertas del catálogo con precios e imágenes en vivo del API. */
export function resolveFlashDealProducts(
  storeProducts: Product[] | undefined,
  limit = 8,
): FeaturedProduct[] {
  const deals = getFlashDealProducts(limit);
  if (!storeProducts?.length) return deals;

  const byId = new Map(storeProducts.map((product) => [product.id, product]));
  return deals.map((featured) => {
    const live = byId.get(featured.id);
    if (!live) return featured;
    return {
      ...featured,
      price: live.price,
      image: resolveProductImageUrl(live),
      brand: live.brand ?? featured.brand ?? null,
      name: live.name,
    };
  });
}

/** Segundos hasta medianoche (America/Lima) para el contador diario. */
export function getSecondsUntilLimaMidnight(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const second = Number(parts.find((p) => p.type === 'second')?.value ?? 0);

  const elapsed = hour * 3600 + minute * 60 + second;
  return Math.max(0, 24 * 3600 - elapsed);
}

export function splitCountdown(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}
