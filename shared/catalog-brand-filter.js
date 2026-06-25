export function normalizeCatalogBrandKey(brand) {
  const trimmed = String(brand ?? '').trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

export function getCatalogBrandLabel(brand) {
  const trimmed = String(brand ?? '').trim();
  if (!trimmed) return null;
  return trimmed;
}

export function buildBrandFacets(products) {
  const map = new Map();
  for (const product of products) {
    const label = getCatalogBrandLabel(product.brand);
    const key = normalizeCatalogBrandKey(product.brand);
    if (!key || !label) continue;
    const prev = map.get(key);
    map.set(key, { key, label, count: (prev?.count ?? 0) + 1 });
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'),
  );
}

export function productMatchesBrandFilter(product, selectedBrandKeys) {
  if (!selectedBrandKeys?.length) return true;
  const key = normalizeCatalogBrandKey(product.brand);
  if (!key) return false;
  return selectedBrandKeys.includes(key);
}
