import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';

/** Título en grilla de catálogo (5 columnas en desktop). */
export const PRODUCT_CARD_TITLE_SIZE = 'text-[0.78rem] leading-[1.2] sm:text-[0.85rem]';

/** Título en vitrina destacada / carrusel (fichas estrechas, 5 por fila; máx. 3 líneas). */
export const PRODUCT_CARD_TITLE_FEATURED_CLASS =
  'text-[0.75rem] font-semibold leading-[1.2] text-foreground sm:text-[0.8125rem]';

export const PRODUCT_CARD_BRAND_CLASS =
  'truncate text-[0.62rem] font-normal uppercase tracking-wide text-muted-foreground sm:text-[0.65rem]';

/** Marca en tarjetas de vitrina (rojo de marca, como el diseño de destacados). */
export const PRODUCT_CARD_BRAND_ACCENT_CLASS =
  'truncate text-[0.62rem] font-semibold uppercase tracking-wide text-red-600 sm:text-[0.65rem]';

/** Título principal en tarjetas de catálogo (nombre del producto tal cual en inventario). */
export const PRODUCT_CARD_TITLE_MAIN_CLASS = `${PRODUCT_CARD_TITLE_SIZE} font-semibold text-foreground`;

/** Máximo 3 líneas en ficha de producto. */
export const PRODUCT_CARD_TITLE_CLAMP_CLASS =
  'line-clamp-3 break-words text-pretty hyphens-auto';

/** Precio actual en tarjetas de catálogo (negrita, un poco más grande que el tachado). */
export const PRODUCT_CARD_PRICE_MAIN_CLASS =
  'text-sm font-bold tabular-nums text-foreground sm:text-[0.95rem]';

/** Precio actual en vitrina de destacados (más prominente, como el diseño de referencia). */
export const PRODUCT_CARD_PRICE_FEATURED_CLASS =
  'text-[0.95rem] font-bold tabular-nums text-foreground sm:text-base';

/** Precio anterior tachado (debajo del precio actual). */
export const PRODUCT_CARD_PRICE_COMPARE_CLASS =
  'text-[0.65rem] font-normal tabular-nums text-muted-foreground line-through decoration-muted-foreground decoration-solid sm:text-xs';

/** Badge de descuento (fondo verde claro, texto verde). */
export const PRODUCT_CARD_DISCOUNT_CLASS =
  'inline-flex shrink-0 rounded px-1 py-px text-[0.6rem] font-semibold leading-none bg-green-50 text-green-700 sm:text-[0.65rem]';

export interface ProductCardTitleContent {
  brand: string | null;
  title: string;
}

function isColorPrinter(product: ProductBadgeSource): boolean {
  const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
  return (
    haystack.includes('color') ||
    haystack.includes('a color') ||
    /\bim\s+c\d{3,4}/i.test(product.name) ||
    /\bbizhub\s+c/i.test(product.name)
  );
}

/** Añade «B/N» en equipos monocromáticos si el nombre aún no lo incluye. */
export function formatProductCardTitle(
  product: ProductBadgeSource & { name: string; category?: string | null },
): string {
  const title = product.name.trim();
  if (!isPrinterProduct(product) || isColorPrinter(product) || /\bB\/N\b/i.test(title)) {
    return title;
  }

  if (/^impresora\s+multifuncional\s+/i.test(title)) {
    return title.replace(/^impresora\s+multifuncional\s+/i, 'Impresora Multifuncional B/N ');
  }

  if (/^impresora\s+/i.test(title)) {
    return title.replace(/^impresora\s+/i, 'Impresora B/N ');
  }

  if (/^multifuncional\s+/i.test(title)) {
    return title.replace(/^multifuncional\s+/i, 'Multifuncional B/N ');
  }

  return `${title} B/N`;
}

export function getProductCardTitleContent(
  product: ProductBadgeSource & { name: string; category?: string | null },
): ProductCardTitleContent {
  const brand = product.brand?.trim() || null;

  return {
    brand: brand ? brand.toUpperCase() : null,
    title: formatProductCardTitle(product),
  };
}
