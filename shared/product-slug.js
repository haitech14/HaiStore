/**
 * Slugs legibles para fichas de producto.
 * Si no hay slug en DB, se deriva del id o del nombre.
 */

const SLUG_MAX_LENGTH = 80;

export function slugifyProductText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

function looksLikeSlug(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(normalized);
}

function isUuidLikeId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(id ?? '').trim(),
  );
}

/**
 * Genera un slug candidato sin comprobar colisiones en el catálogo.
 * @param {{ id?: string, name?: string, slug?: string | null }} product
 */
export function proposeProductSlug(product) {
  const explicit = String(product?.slug ?? '').trim();
  if (explicit) return explicit.toLowerCase();

  const id = String(product?.id ?? '').trim();
  if (looksLikeSlug(id) && !isUuidLikeId(id)) return id.toLowerCase();

  const fromName = slugifyProductText(product?.name);
  if (!fromName) return id.toLowerCase();

  const idSuffix = slugifyProductText(id).slice(-12);
  if (!idSuffix || fromName.endsWith(idSuffix)) return fromName;
  return `${fromName}-${idSuffix}`.slice(0, SLUG_MAX_LENGTH);
}

/**
 * @param {{ id?: string, name?: string, slug?: string | null }} product
 */
export function deriveProductSlug(product) {
  return proposeProductSlug(product);
}

/**
 * Asigna slugs únicos y persistentes a todo el catálogo.
 * @param {Array<{ id?: string, name?: string, slug?: string | null }>} products
 */
export function assignUniqueProductSlugs(products) {
  if (!Array.isArray(products)) return { products: [], assigned: 0, unchanged: 0, total: 0 };

  const used = new Set();
  const sorted = [...products].sort((a, b) =>
    String(a.id ?? '').localeCompare(String(b.id ?? ''), 'es'),
  );

  for (const product of sorted) {
    const current = String(product.slug ?? '').trim().toLowerCase();
    if (current) used.add(current);
  }

  let assigned = 0;
  let unchanged = 0;

  const next = sorted.map((product) => {
    const current = String(product.slug ?? '').trim();
    if (current) {
      unchanged += 1;
      return product;
    }

    let candidate = proposeProductSlug(product);
    if (used.has(candidate)) {
      const base = slugifyProductText(product.name) || slugifyProductText(product.id) || 'producto';
      let suffix = 2;
      while (used.has(`${base}-${suffix}`)) suffix += 1;
      candidate = `${base}-${suffix}`.slice(0, SLUG_MAX_LENGTH);
    }

    used.add(candidate);
    assigned += 1;
    return { ...product, slug: candidate };
  });

  return { products: next, assigned, unchanged, total: next.length };
}

/**
 * @param {{ id?: string, slug?: string | null, name?: string }} product
 */
export function buildProductPath(product) {
  const slug = deriveProductSlug(product);
  return `/tienda/producto/${encodeURIComponent(slug)}`;
}

/**
 * @param {Array<{ id?: string, slug?: string | null, name?: string }>} products
 * @param {string} lookupKey
 */
export function findProductBySlugOrId(products, lookupKey) {
  const normalized = String(lookupKey ?? '').trim();
  if (!normalized || !Array.isArray(products)) return undefined;

  const lower = normalized.toLowerCase();

  let found = products.find((product) => String(product.id ?? '').toLowerCase() === lower);
  if (found) return found;

  found = products.find((product) => String(product.slug ?? '').trim().toLowerCase() === lower);
  if (found) return found;

  found = products.find((product) => deriveProductSlug(product).toLowerCase() === lower);
  return found;
}
