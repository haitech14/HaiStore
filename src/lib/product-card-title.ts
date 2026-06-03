import type { ProductBadgeSource } from '@/lib/product-detail-badges';

export const PRODUCT_CARD_TITLE_SIZE = 'text-sm sm:text-[0.95rem]';

export const PRODUCT_CARD_BRAND_CLASS =
  'truncate text-[0.65rem] font-normal uppercase tracking-wider text-muted-foreground';

/** Título principal en tarjetas de catálogo (nombre del producto tal cual en inventario). */
export const PRODUCT_CARD_TITLE_MAIN_CLASS = `${PRODUCT_CARD_TITLE_SIZE} font-bold leading-snug text-foreground`;

/** Precio actual en tarjetas de catálogo (más pequeño que el título). */
export const PRODUCT_CARD_PRICE_MAIN_CLASS =
  'text-xs font-semibold tabular-nums text-foreground sm:text-sm';

/** Precio anterior tachado (precio «normal»). */
export const PRODUCT_CARD_PRICE_COMPARE_CLASS =
  'text-xs font-normal tabular-nums text-muted-foreground line-through decoration-muted-foreground decoration-solid';

/** Badge de descuento junto al precio. */
export const PRODUCT_CARD_DISCOUNT_CLASS = 'text-xs font-semibold text-green-600';

export interface ProductCardTitleContent {
  brand: string | null;
  title: string;
}

export function getProductCardTitleContent(
  product: ProductBadgeSource & { name: string; category?: string | null },
): ProductCardTitleContent {
  const brand = product.brand?.trim() || null;

  return {
    brand: brand ? brand.toUpperCase() : null,
    title: product.name.trim(),
  };
}
