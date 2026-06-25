/**
 * Resolución de productos por id legado, alias o código de inventario.
 * Usado en API (detalle y lotes) para enlaces con slugs antiguos o ids sintéticos.
 */

/** Slugs o ids históricos → id canónico en inventory.json */
export const PRODUCT_ID_ALIASES = {
  'ricoh-im-460f': '71289ec2-dbca-4780-b319-eb3d259fadb5',
};

export function resolveCanonicalProductId(lookupKey) {
  const normalized = String(lookupKey ?? '').trim();
  if (!normalized) return undefined;
  const lower = normalized.toLowerCase();
  const alias = PRODUCT_ID_ALIASES[lower];
  if (alias) return alias;
  if (lower.startsWith('toner-compat-')) {
    return normalized.slice('toner-'.length);
  }
  if (lower.startsWith('toner-')) {
    return normalized.slice('toner-'.length);
  }
  return normalized;
}

/** Extrae SKU numérico de ids como toner-419078 o ricoh-acc-418080. */
export function extractSkuFromSyntheticId(id) {
  const normalized = String(id ?? '').trim();
  const match = normalized.match(/(?:^|-)(\d{5,})$/);
  return match?.[1];
}

function normalizeCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

import { deriveProductSlug, findProductBySlugOrId } from './product-slug.js';

/**
 * Busca un producto de inventario por id, slug, alias o código.
 * @param {Array<{ id?: string, code?: string, slug?: string | null, name?: string }>} products
 * @param {string} lookupKey
 */
export function findInventoryProductByLookupKey(products, lookupKey) {
  const normalized = String(lookupKey ?? '').trim();
  if (!normalized || !Array.isArray(products)) return undefined;

  const canonical = resolveCanonicalProductId(normalized);
  const canonicalLower = canonical.toLowerCase();

  let found = findProductBySlugOrId(products, canonical);
  if (found) return found;

  found = products.find((product) => product.id === canonical);
  if (found) return found;

  found = products.find((product) => String(product.id ?? '').toLowerCase() === canonicalLower);
  if (found) return found;

  const codeNorm = normalizeCode(canonical);
  if (codeNorm) {
    found = products.find((product) => normalizeCode(product.code) === codeNorm);
    if (found) return found;
  }

  const sku = extractSkuFromSyntheticId(normalized);
  if (sku) {
    found = products.find((product) => normalizeCode(product.code) === normalizeCode(sku));
    if (found) return found;
  }

  found = products.find((product) => deriveProductSlug(product).toLowerCase() === canonicalLower);
  return found;
}
