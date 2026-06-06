export type CatalogGridColumns = 3 | 4 | 5;

export const CATALOG_GRID_COLUMN_OPTIONS: readonly CatalogGridColumns[] = [5, 4, 3];

export function catalogGridClassName(columns: CatalogGridColumns): string {
  switch (columns) {
    case 3:
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
    case 4:
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    case 5:
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    default: {
      const _exhaustive: never = columns;
      return _exhaustive;
    }
  }
}
