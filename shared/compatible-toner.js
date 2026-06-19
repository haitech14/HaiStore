export const CATEGORY_COMPATIBLE_TONER = 'Toner Compatibles Haitone';
export const CATEGORY_COMPATIBLE_TONER_LEGACY = 'Toner Compatibles';

export const COMPATIBLE_TONER_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_TONER,
  CATEGORY_COMPATIBLE_TONER_LEGACY,
];

export const COMPATIBLE_TONER_SUBCATEGORY_ID = 'cat-toner-compatibles';
export const COMPATIBLE_TONER_SUBCATEGORY_SLUG = 'toner-compatibles';

/**
 * @param {unknown} category
 */
export function isCompatibleTonerCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_TONER_INVENTORY_LABELS.includes(normalized);
}

/**
 * @param {unknown} category
 */
export function normalizeCompatibleTonerCategory(category) {
  if (isCompatibleTonerCategory(category)) return CATEGORY_COMPATIBLE_TONER;
  return category;
}

/**
 * @param {unknown} name
 */
export function appendHaitoneProductSuffix(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) return trimmed;
  if (/\bHaitone\b/i.test(trimmed)) return trimmed;
  return `${trimmed} Haitone`;
}

/**
 * @param {Record<string, unknown> | null | undefined} product
 */
export function normalizeCompatibleTonerProductFields(product) {
  if (!product || !isCompatibleTonerCategory(product.category)) {
    return product;
  }

  const name = appendHaitoneProductSuffix(product.name);
  const rawDescription = product.description;
  const description =
    rawDescription == null || rawDescription === product.name
      ? name
      : appendHaitoneProductSuffix(rawDescription);

  return {
    ...product,
    category: CATEGORY_COMPATIBLE_TONER,
    name,
    description,
  };
}
