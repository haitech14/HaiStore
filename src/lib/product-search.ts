import { productMatchesCategoryFilter, productMatchesCategoryFilterTree } from '@/lib/inventory-categories';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export const MIN_PRODUCT_SEARCH_LENGTH = 3;
export const PRODUCT_SEARCH_SUGGESTION_LIMIT = 8;

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function productSearchHaystack(product: Product): string {
  return [
    product.name,
    product.code,
    product.description,
    product.brand,
    product.category,
    ...(product.attributes?.map((attr) => `${attr.name} ${attr.value}`) ?? []),
  ]
    .filter(Boolean)
    .join(' ');
}

export function productMatchesSearchQuery(product: Product, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return false;
  }
  return normalizeSearchText(productSearchHaystack(product)).includes(normalizedQuery);
}

export function filterProductsBySearch(
  products: Product[],
  query: string,
  options: {
    categoryFilter?: string;
    categoryTree?: StoreCategoryTreeNode[];
    limit?: number;
  } = {},
): Product[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return [];
  }

  const categoryFilter = options.categoryFilter?.trim() || 'all';
  let list = products.filter((product) => productMatchesSearchQuery(product, query));

  if (categoryFilter !== 'all') {
    const tree = options.categoryTree ?? [];
    list = list.filter((product) =>
      tree.length > 0
        ? productMatchesCategoryFilterTree(product, categoryFilter, tree)
        : productMatchesCategoryFilter(product, categoryFilter),
    );
  }

  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const limit = options.limit;
  return limit != null && limit > 0 ? sorted.slice(0, limit) : sorted;
}
