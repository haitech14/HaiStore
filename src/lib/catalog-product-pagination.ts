export const CATALOG_PRODUCTS_PER_PAGE = 10;

export function getCatalogTotalPages(totalItems: number, pageSize = CATALOG_PRODUCTS_PER_PAGE): number {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

export function getCatalogPageSlice<T>(
  items: readonly T[],
  page: number,
  pageSize = CATALOG_PRODUCTS_PER_PAGE,
): T[] {
  const safePage = Math.max(1, Math.min(page, getCatalogTotalPages(items.length, pageSize)));
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function clampCatalogPage(page: number, totalPages: number): number {
  return Math.max(1, Math.min(page, Math.max(1, totalPages)));
}
