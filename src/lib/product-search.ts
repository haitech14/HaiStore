import { categories } from '@/data/categories';
import { megaMenuServiceLinks } from '@/data/mega-menu';
import { productMatchesCategoryFilter, productMatchesCategoryFilterTree } from '@/lib/inventory-categories';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';
import {
  normalizeCatalogSearchText,
  productMatchesSearchQuery,
  productSearchHaystack,
  sortProductsBySearchRelevance,
} from '../../shared/catalog-search.js';

export const MIN_PRODUCT_SEARCH_LENGTH = 3;
export const PRODUCT_SEARCH_INITIAL_VISIBLE = 6;
export const PRODUCT_SEARCH_LOAD_MORE_STEP = 6;
export const PRODUCT_SEARCH_MAX_LIMIT = 24;
/** @deprecated Usar PRODUCT_SEARCH_INITIAL_VISIBLE + paginación en el panel. */
export const PRODUCT_SEARCH_SUGGESTION_LIMIT = PRODUCT_SEARCH_MAX_LIMIT;
export const SEARCH_CATEGORY_SUGGESTION_LIMIT = 3;
export const SEARCH_SERVICE_SUGGESTION_LIMIT = 2;

export function normalizeSearchText(value: string): string {
  return normalizeCatalogSearchText(value);
}

function searchTerms(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

function textMatchesSearchQuery(haystack: string, query: string): boolean {
  const terms = searchTerms(query);
  if (terms.length === 0) return false;
  const normalizedHaystack = normalizeSearchText(haystack);
  return terms.every((term) => normalizedHaystack.includes(term));
}

export { productMatchesSearchQuery, productSearchHaystack };

export interface SearchCategorySuggestion {
  type: 'category';
  slug: string;
  name: string;
  subtitle: string;
}

export interface SearchServiceSuggestion {
  type: 'service';
  href: string;
  name: string;
  subtitle: string;
}

export function filterCategoriesBySearch(
  query: string,
  limit = SEARCH_CATEGORY_SUGGESTION_LIMIT,
): SearchCategorySuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return [];
  }

  return categories
    .filter(
      (category) =>
        textMatchesSearchQuery(`${category.name} ${category.tagline}`, query) ||
        category.inventoryCategories?.some((label) => textMatchesSearchQuery(label, query)),
    )
    .slice(0, limit)
    .map((category) => ({
      type: 'category' as const,
      slug: category.slug,
      name: category.name,
      subtitle: category.tagline,
    }));
}

export function filterServicesBySearch(
  query: string,
  limit = SEARCH_SERVICE_SUGGESTION_LIMIT,
): SearchServiceSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return [];
  }

  return megaMenuServiceLinks
    .filter((service) => textMatchesSearchQuery(`${service.label} ${service.description}`, query))
    .slice(0, limit)
    .map((service) => ({
      type: 'service' as const,
      href: service.href,
      name: service.label,
      subtitle: service.description,
    }));
}

export interface SearchProductCategoryGroup {
  category: string;
  products: Product[];
}

const SEARCH_CATEGORY_DISPLAY_ORDER: RegExp[] = [
  /multifuncion|impresor|formato ancho|plotter|copiadora|esc[aá]ner|equipo/i,
  /consumible|toner|t[oó]ner|suministro/i,
  /repuesto/i,
  /accesorio/i,
];

function getSearchCategorySortRank(category: string): number {
  const index = SEARCH_CATEGORY_DISPLAY_ORDER.findIndex((pattern) => pattern.test(category));
  return index === -1 ? SEARCH_CATEGORY_DISPLAY_ORDER.length : index;
}

/** Emoji por división de inventario (equipos primero en el orden de grupos). */
export function getSearchCategoryEmoji(category: string): string {
  const normalized = category.toLowerCase();
  if (SEARCH_CATEGORY_DISPLAY_ORDER[0].test(normalized)) return '🖨️';
  if (SEARCH_CATEGORY_DISPLAY_ORDER[1].test(normalized)) return '🧴';
  if (SEARCH_CATEGORY_DISPLAY_ORDER[2].test(normalized)) return '🔧';
  if (SEARCH_CATEGORY_DISPLAY_ORDER[3].test(normalized)) return '🔌';
  return '📦';
}

/** Agrupa resultados de búsqueda por categoría para el panel de sugerencias. */
export function groupSearchProductsByCategory(
  products: Product[],
  query?: string,
): SearchProductCategoryGroup[] {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const category = product.category?.trim() || 'Sin categoría';
    const bucket = groups.get(category) ?? [];
    bucket.push(product);
    groups.set(category, bucket);
  }

  const sortProducts = (items: Product[]) => {
    if (query?.trim()) {
      return sortProductsBySearchRelevance(items, query);
    }
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  };

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      const rankDiff = getSearchCategorySortRank(a) - getSearchCategorySortRank(b);
      if (rankDiff !== 0) return rankDiff;
      return a.localeCompare(b, 'es');
    })
    .map(([category, items]) => ({
      category,
      products: sortProducts(items),
    }));
}

/** Recorta grupos conservando el orden por división (equipos primero). */
export function limitSearchProductCategoryGroups(
  groups: SearchProductCategoryGroup[],
  limit: number,
): SearchProductCategoryGroup[] {
  if (limit <= 0) return [];

  const limited: SearchProductCategoryGroup[] = [];
  let count = 0;

  for (const group of groups) {
    const products: Product[] = [];
    for (const product of group.products) {
      if (count >= limit) break;
      products.push(product);
      count += 1;
    }
    if (products.length > 0) {
      limited.push({ category: group.category, products });
    }
    if (count >= limit) break;
  }

  return limited;
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

  const sorted = sortProductsBySearchRelevance(list, query);
  const limit = options.limit;
  return limit != null && limit > 0 ? sorted.slice(0, limit) : sorted;
}
