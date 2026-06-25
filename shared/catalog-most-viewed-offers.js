/** Atributo virtual de catálogo para productos con más visitas. */
export const MOST_VIEWED_OFFER_ATTR_NAME = 'Ofertas';
export const MOST_VIEWED_OFFER_ATTR_VALUE = 'Más vistos';
export const MOST_VIEWED_OFFER_ATTR_KEY = `${MOST_VIEWED_OFFER_ATTR_NAME}::${MOST_VIEWED_OFFER_ATTR_VALUE}`;
export const MOST_VIEWED_OFFER_ATTR_LABEL = `${MOST_VIEWED_OFFER_ATTR_NAME}: ${MOST_VIEWED_OFFER_ATTR_VALUE}`;

const DEFAULT_OPTIONS = {
  minViews: 1,
  limitRatio: 0.15,
  minLimit: 4,
  maxLimit: 32,
};

function readProductViewCount(product) {
  const views = Number(product?.view_count);
  return Number.isFinite(views) && views > 0 ? Math.floor(views) : 0;
}

/**
 * IDs de productos «más vistos» dentro de un universo de catálogo (p. ej. facetBase).
 * @param {readonly object[]} products
 * @param {Partial<typeof DEFAULT_OPTIONS>} [options]
 * @returns {Set<string>}
 */
export function resolveMostViewedOfferProductIds(products, options = {}) {
  const { minViews, limitRatio, minLimit, maxLimit } = { ...DEFAULT_OPTIONS, ...options };
  if (!products?.length) return new Set();

  const scored = products
    .map((product) => ({
      id: product.id,
      views: readProductViewCount(product),
    }))
    .filter((entry) => entry.views >= minViews)
    .sort(
      (a, b) =>
        b.views - a.views || String(a.id).localeCompare(String(b.id), 'es'),
    );

  if (scored.length === 0) return new Set();

  const limit = Math.min(
    maxLimit,
    Math.max(minLimit, Math.ceil(products.length * limitRatio)),
  );

  return new Set(scored.slice(0, limit).map((entry) => entry.id));
}

export function productHasMostViewedOfferAttribute(product, offerIds) {
  if (!product?.id || !offerIds?.size) return false;
  return offerIds.has(product.id);
}

export function resolveCatalogAttributeKeys(product, offerIds = new Set()) {
  const keys = new Set();
  for (const attr of product?.attributes ?? []) {
    if (attr?.name && attr?.value) {
      keys.add(`${attr.name}::${attr.value}`);
    }
  }
  if (productHasMostViewedOfferAttribute(product, offerIds)) {
    keys.add(MOST_VIEWED_OFFER_ATTR_KEY);
  }
  return keys;
}

export function productMatchesMostViewedOfferFilter(product, offerIds) {
  return productHasMostViewedOfferAttribute(product, offerIds);
}

export function appendMostViewedOfferFacet(facets, offerIds) {
  if (!offerIds?.size) return facets;
  const count = offerIds.size;
  const withoutDuplicate = facets.filter((facet) => facet.key !== MOST_VIEWED_OFFER_ATTR_KEY);
  return [
    {
      key: MOST_VIEWED_OFFER_ATTR_KEY,
      label: MOST_VIEWED_OFFER_ATTR_LABEL,
      count,
    },
    ...withoutDuplicate,
  ].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
}

export function compareProductsByViewCount(a, b) {
  const av = readProductViewCount(a);
  const bv = readProductViewCount(b);
  if (bv !== av) return bv - av;
  return a.name.localeCompare(b.name, 'es');
}
