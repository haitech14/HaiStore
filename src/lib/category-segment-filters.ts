import { PRODUCCION_ATTR, resolveProductCatalogAttributeKeys } from '@/lib/category-catalog-filters';
import type { Product } from '@/types/product';

export const CATEGORY_SEGMENT_FILTERS = [
  {
    id: 'oficina-pequena',
    label: 'Para oficina pequeña',
    productionKeys: [
      `${PRODUCCION_ATTR}::Basico (>5000 páginas)`,
      `${PRODUCCION_ATTR}::Mediano (15,000 páginas aprox)`,
    ],
    targetCategorySlug: 'multifuncionales',
  },
  {
    id: 'alto-volumen',
    label: 'Alto volumen',
    productionKeys: [
      `${PRODUCCION_ATTR}::Alta Producción (50,000 páginas aprox)`,
      `${PRODUCCION_ATTR}::Producción (200,000 a 500,000 páginas aprox)`,
    ],
    targetCategorySlug: 'multifuncionales',
  },
  {
    id: 'alquiler-mensual',
    label: 'Alquiler mensual',
    productionKeys: [] as const,
    targetCategorySlug: 'alquiler',
  },
] as const;

export type CategorySegmentFilterId = (typeof CATEGORY_SEGMENT_FILTERS)[number]['id'];

export function findCategorySegmentFilter(id: string | null | undefined) {
  if (!id) return undefined;
  return CATEGORY_SEGMENT_FILTERS.find((item) => item.id === id);
}

export function productMatchesSegmentFilter(
  product: Product,
  segmentId: CategorySegmentFilterId | null,
): boolean {
  if (!segmentId) return true;

  const segment = findCategorySegmentFilter(segmentId);
  if (!segment || segment.productionKeys.length === 0) return true;

  const resolved = resolveProductCatalogAttributeKeys(product);
  return segment.productionKeys.some((key) => resolved.has(key));
}

function isAlquilerProduct(product: Product): boolean {
  return /alquiler/i.test(product.category ?? '');
}

export function countProductsForSegmentFilter(
  products: readonly Product[],
  segmentId: CategorySegmentFilterId,
): number {
  const segment = findCategorySegmentFilter(segmentId);
  if (!segment) return 0;

  if (segment.id === 'alquiler-mensual') {
    return products.filter(isAlquilerProduct).length;
  }

  return products.filter((product) => productMatchesSegmentFilter(product, segmentId)).length;
}

export function buildCategorySegmentFilterTabs(products: readonly Product[]) {
  return CATEGORY_SEGMENT_FILTERS.map(({ id, label }) => ({
    key: id,
    label,
    count: countProductsForSegmentFilter(products, id),
  }));
}

export function toggleCategorySegmentFilter(
  selectedId: CategorySegmentFilterId | null,
  nextId: CategorySegmentFilterId,
): CategorySegmentFilterId | null {
  return selectedId === nextId ? null : nextId;
}
