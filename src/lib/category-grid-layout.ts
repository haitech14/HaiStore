export type CatalogGridColumns = 3 | 4 | 5 | 6;

export const CATALOG_GRID_COLUMN_OPTIONS: readonly CatalogGridColumns[] = [5, 6, 4, 3];

export function catalogGridClassName(columns: CatalogGridColumns): string {
  const stretch = 'items-stretch';
  switch (columns) {
    case 3:
      return `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${stretch}`;
    case 4:
      return `grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${stretch}`;
    case 5:
      return `grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3 ${stretch}`;
    case 6:
      return `grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-3 ${stretch}`;
    default: {
      const _exhaustive: never = columns;
      return _exhaustive;
    }
  }
}
