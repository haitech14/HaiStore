import { readInventory, toPublicProduct } from './inventory-store.js';
import { getHomeApiCache } from './home-api-cache.js';
import { withResolvedMedia } from './product-catalog.js';
import {
  HOME_HIGHLIGHTED_ROW_SIZE,
  MIN_HOME_FEATURED,
  resolveHomeHighlightedRowProducts,
} from '../../shared/home-highlighted-products.js';

/** Etiquetas de inventario por slug de categoría (home destacados). */
const CATEGORY_LABELS = {
  multifuncionales: [
    'Multifuncionales',
    'Multifuncionales Nuevas',
    'Multifuncionales, Multifuncionales Nuevas',
    'Multifuncionales Seminuevas',
    'Multifuncionales, Multifuncionales Seminuevas',
  ],
};

function productMatchesCategoryLabels(product, labels) {
  const category = String(product.category ?? '').toLowerCase();
  if (!category) return false;
  return labels.some((label) => category.includes(label.toLowerCase()));
}

function productInStockWithPrice(product) {
  const price = Number(product.prices?.public ?? product.price ?? 0);
  const stock = Number(product.stock ?? 0);
  return stock > 0 && price > 0;
}

function filterInStockForLabels(products, labels) {
  return products.filter(
    (product) => productInStockWithPrice(product) && productMatchesCategoryLabels(product, labels),
  );
}

function toHomeFeaturedPayload(product) {
  return product;
}

export function buildHomeFeaturedFromProducts(
  products,
  role = 'public',
  { categorySlug = 'multifuncionales', limit = HOME_HIGHLIGHTED_ROW_SIZE } = {},
) {
  const labels = CATEGORY_LABELS[categorySlug] ?? CATEGORY_LABELS.multifuncionales;
  const safeLimit = Math.min(Math.max(Number(limit) || HOME_HIGHLIGHTED_ROW_SIZE, 1), 12);
  const candidates = filterInStockForLabels(products, labels);
  if (candidates.length < MIN_HOME_FEATURED) {
    return [];
  }

  const highlighted = resolveHomeHighlightedRowProducts(
    candidates.map((product) => toPublicProduct(withResolvedMedia(product), role)),
  );
  return highlighted.slice(0, safeLimit).map(toHomeFeaturedPayload);
}

async function listHomeFeaturedProductsUncached({
  role = 'public',
  categorySlug = 'multifuncionales',
  limit = HOME_HIGHLIGHTED_ROW_SIZE,
} = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || HOME_HIGHLIGHTED_ROW_SIZE, 1), 12);
  const { products } = await readInventory();
  return buildHomeFeaturedFromProducts(products, role, { categorySlug, limit: safeLimit });
}

/**
 * Productos destacados para la home (fila fija de multifuncionales en stock).
 */
export async function listHomeFeaturedProducts(options = {}) {
  const {
    role = 'public',
    categorySlug = 'multifuncionales',
    limit = HOME_HIGHLIGHTED_ROW_SIZE,
  } = options;
  const safeLimit = Math.min(Math.max(Number(limit) || HOME_HIGHLIGHTED_ROW_SIZE, 1), 12);
  const cacheKey = `featured:${role}:${categorySlug}:${safeLimit}`;

  return getHomeApiCache(cacheKey, () =>
    listHomeFeaturedProductsUncached({ role, categorySlug, limit: safeLimit }),
  );
}
