export const CATEGORY_HERO_ID = 'categoria-hero';

import type { ProductCondition } from '@/lib/product-condition';

export function categoryPath(slug: string, subSlug?: string | null): string {
  const base = `/categoria/${slug}`;
  if (subSlug) return `${base}?sub=${encodeURIComponent(subSlug)}`;
  return `${base}#${CATEGORY_HERO_ID}`;
}

export function categoryPathWithCondition(
  slug: string,
  condition: ProductCondition,
  subSlug?: string | null,
): string {
  const params = new URLSearchParams();
  if (subSlug) params.set('sub', subSlug);
  params.set('estado', condition);
  return `/categoria/${slug}?${params.toString()}#${CATEGORY_HERO_ID}`;
}

export function categoryPathAll(slug: string, subSlug?: string | null): string {
  const params = new URLSearchParams();
  if (subSlug) params.set('sub', subSlug);
  const query = params.toString();
  return `/categoria/${slug}${query ? `?${query}` : ''}#${CATEGORY_HERO_ID}`;
}

export function scrollToCategoryHero(behavior: ScrollBehavior = 'smooth') {
  const target = document.getElementById(CATEGORY_HERO_ID);
  if (!target) return;
  target.scrollIntoView({ behavior, block: 'start' });
}
