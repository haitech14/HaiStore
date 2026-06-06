import {
  inferAdf,
  inferProduccionTier,
  PRODUCCION_ATTR,
  PRODUCTION_FILTER_OPTIONS,
} from '@/lib/category-catalog-filters';
import { buildProductDetailBadges } from '@/lib/product-detail-badges';
import type { Product } from '@/types/product';

export const PRODUCT_TABLE_SPEC_COLUMNS = [
  { id: 'velocidad', label: 'Velocidad' },
  { id: 'adf', label: 'ADF' },
  { id: 'produccion', label: 'Producción' },
  { id: 'anio', label: 'Año fab.' },
] as const;

const PRODUCTION_TABLE_LABELS: Record<string, string> = {
  'Basico (>5000 páginas)': 'Básico',
  'Mediano (15,000 páginas aprox)': 'Mediano',
  'Alta Producción (50,000 páginas aprox)': 'Alta prod.',
  'Producción (200,000 a 500,000 páginas aprox)': 'Producción',
};

export function formatProductTableCategory(category: string | null | undefined): string {
  if (!category?.trim()) return '—';
  const value = category.trim();
  if (value === 'Multifuncionales Seminuevas') return 'Multif. seminuevas';
  if (value === 'Multifuncionales Nuevas') return 'Multif. nuevas';
  if (value.startsWith('Multifuncionales ')) {
    return `Multif. ${value.slice('Multifuncionales '.length).toLowerCase()}`;
  }
  return value;
}

export type ProductTableSpecColumnId = (typeof PRODUCT_TABLE_SPEC_COLUMNS)[number]['id'];

function normalizeAttrName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function findAttributeValue(product: Product, needles: readonly string[]): string | null {
  for (const attr of product.attributes ?? []) {
    const key = normalizeAttrName(attr.name);
    const value = attr.value?.trim();
    if (!key || !value) continue;
    if (needles.some((needle) => key === needle || key.includes(needle))) {
      return value;
    }
  }
  return null;
}

function shortenProduccion(value: string, forTable = false): string {
  const trimmed = value.trim();
  const option = PRODUCTION_FILTER_OPTIONS.find(
    (row) => row.value === trimmed || trimmed.startsWith(row.value.slice(0, 12)),
  );
  if (option) {
    if (forTable) {
      return PRODUCTION_TABLE_LABELS[option.value] ?? option.sidebarLabel;
    }
    return option.sidebarLabel;
  }

  if (forTable && trimmed.length > 14) {
    return `${trimmed.slice(0, 12)}…`;
  }
  if (trimmed.length > 32) {
    return `${trimmed.slice(0, 30)}…`;
  }
  return trimmed;
}

function formatAdfDisplay(value: string): string {
  const trimmed = value.trim();
  if (/doble\s*scan/i.test(trimmed)) return 'Doble Scan';
  if (/estandar|estándar/i.test(trimmed)) return 'Estándar';
  if (/no tiene/i.test(trimmed)) return '—';
  return trimmed;
}

function resolveVelocidad(product: Product): string {
  const stored = findAttributeValue(product, ['velocidad', 'ppm', 'velocidad de impresion']);
  if (stored) return stored;

  const badge = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (row) => row.id === 'velocidad',
  );
  return badge?.value ?? '—';
}

function resolveAdf(product: Product): string {
  const stored = findAttributeValue(product, ['alimentador (adf)', 'alimentador', 'adf', 'escaner adf']);
  if (stored) return formatAdfDisplay(stored);

  const adf = inferAdf(product);
  return adf ?? '—';
}

function resolveProduccion(product: Product, forTable = false): string {
  const stored = (product.attributes ?? []).find(
    (attr) => attr.name.trim() === PRODUCCION_ATTR,
  )?.value;
  if (stored?.trim()) return shortenProduccion(stored, forTable);

  if (/multifunc/i.test(product.category ?? '')) {
    return shortenProduccion(inferProduccionTier(product), forTable);
  }

  const generic = findAttributeValue(product, ['produccion', 'producción']);
  return generic ? shortenProduccion(generic, forTable) : '—';
}

function resolveAnioFabricacion(product: Product): string {
  const stored = findAttributeValue(product, [
    'ano fabricacion',
    'año fabricacion',
    'ano de fabricacion',
    'año de fabricación',
    'fabricacion',
    'fabricación',
    'year',
    'año',
  ]);
  return stored ?? '—';
}

export function getProductTableSpecDisplay(
  product: Product,
  columnId: ProductTableSpecColumnId,
): string {
  switch (columnId) {
    case 'velocidad':
      return resolveVelocidad(product);
    case 'adf':
      return resolveAdf(product);
    case 'produccion':
      return resolveProduccion(product, true);
    case 'anio':
      return resolveAnioFabricacion(product);
    default:
      return '—';
  }
}
