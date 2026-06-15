import { FEATURED_PRODUCT_IDS } from '@/data/featured-products';
import { HOME_HIGHLIGHTED_MODEL_PATTERNS } from '@/data/home-highlighted-products';
import type { FeaturedProduct } from '@/data/featured-products';
import { shuffleProductsDaily } from '@/lib/daily-shuffle';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { productToFeatured } from '@/lib/store-products';
import type { Product } from '@/types/product';

/** Productos visibles en la fila «Lo más destacado» del inicio. */
export const HOME_HIGHLIGHTED_ROW_SIZE = 6;

/** Múltiplo de 5 para páginas completas en el carrusel (cada bullet = 5 productos). */
export const HOME_FEATURED_LIMIT = 15;
export const MIN_HOME_FEATURED = 3;

export function filterInStockProductsForCategoryLabels(
  products: Product[] | undefined,
  labels: readonly string[],
): Product[] {
  if (!products?.length || labels.length === 0) return [];

  return products.filter(
    (product) =>
      product.stock > 0 &&
      product.price > 0 &&
      labels.some((label) => productMatchesCategoryFilter(product, label)),
  );
}

export function countInStockProductsForCategoryLabels(
  products: Product[] | undefined,
  labels: readonly string[],
): number {
  return filterInStockProductsForCategoryLabels(products, labels).length;
}

/** Fila fija de 6 equipos Ricoh en el orden del diseño de referencia. */
export function resolveHomeHighlightedRowProducts(inCategory: Product[]): Product[] {
  if (inCategory.length === 0) return [];

  const usedIds = new Set<string>();
  const ordered: Product[] = [];

  for (const pattern of HOME_HIGHLIGHTED_MODEL_PATTERNS) {
    const match = inCategory.find(
      (product) => !usedIds.has(product.id) && pattern.test(`${product.name} ${product.code ?? ''}`),
    );
    if (match) {
      usedIds.add(match.id);
      ordered.push(match);
    }
  }

  if (ordered.length < HOME_HIGHLIGHTED_ROW_SIZE) {
    const featured = resolveHomeFeaturedProducts(inCategory, HOME_HIGHLIGHTED_ROW_SIZE);
    const byId = new Map(inCategory.map((product) => [product.id, product]));

    for (const item of featured) {
      if (ordered.length >= HOME_HIGHLIGHTED_ROW_SIZE) break;
      const product = byId.get(item.id);
      if (!product || usedIds.has(product.id)) continue;
      usedIds.add(product.id);
      ordered.push(product);
    }
  }

  return ordered.slice(0, HOME_HIGHLIGHTED_ROW_SIZE);
}

/**
 * Productos destacados del inicio: solo inventario en vivo con stock,
 * prioriza `is_featured` e ids configurados, rellena con orden aleatorio diario.
 */
export function resolveHomeFeaturedProducts(
  storeProducts: Product[] | undefined,
  limit = HOME_FEATURED_LIMIT,
): FeaturedProduct[] {
  if (!storeProducts?.length) return [];

  const inStock = storeProducts.filter((product) => product.stock > 0 && product.price > 0);
  if (inStock.length < MIN_HOME_FEATURED) return [];

  const byId = new Map(inStock.map((product) => [product.id, product]));
  const selectedIds = new Set<string>();
  const pool: Product[] = [];

  const add = (product: Product | undefined) => {
    if (!product || selectedIds.has(product.id)) return;
    selectedIds.add(product.id);
    pool.push(product);
  };

  for (const product of inStock) {
    if (product.is_featured === true) add(product);
  }

  for (const id of FEATURED_PRODUCT_IDS) {
    add(byId.get(id));
  }

  const remaining = shuffleProductsDaily(inStock.filter((product) => !selectedIds.has(product.id)));
  for (const product of remaining) {
    if (pool.length >= limit) break;
    add(product);
  }

  return shuffleProductsDaily(pool)
    .slice(0, limit)
    .map((product) => enrichFeaturedFromCatalog(productToFeatured(product)));
}
