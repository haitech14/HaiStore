import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { formatRendLabel } from './repuestos-products-excel.js';
import {
  buildRicohLpProductName,
  concatenateRicohModelos,
} from './ricoh-lp-web-excel.js';

export const CATEGORY_TONER = 'Toner Original';

const MODELO_ATTR = 'Modelo de equipo';
const RENDIMIENTO_ATTR = 'Rendimiento (5%)';

/**
 * @param {string} name
 */
export function stripModelSuffixFromName(name) {
  const trimmed = String(name ?? '').trim();
  const dashIdx = trimmed.lastIndexOf(' — ');
  if (dashIdx > 0) {
    return trimmed.slice(0, dashIdx).trim();
  }
  return trimmed;
}

/**
 * @param {string} name
 */
export function stripYieldSuffixFromName(name) {
  let base = stripModelSuffixFromName(name);
  base = base.replace(/\s*\([^)]*5%-A4\)\s*$/i, '').trim();
  base = base.replace(/\s*\(Rend\s+[^)]+\)\s*$/i, '').trim();
  return base;
}

/**
 * @param {{ name?: string; attributes?: Array<{ name?: string; value?: string }> }} product
 */
export function extractModeloFromProduct(product) {
  const attr = (product.attributes ?? []).find((row) => row.name === MODELO_ATTR);
  if (attr?.value?.trim()) {
    return attr.value.trim();
  }
  const name = String(product.name ?? '').trim();
  const dashIdx = name.lastIndexOf(' — ');
  if (dashIdx > 0) {
    return name.slice(dashIdx + 3).trim();
  }
  return '';
}

/**
 * @param {{ attributes?: Array<{ name?: string; value?: string }> }} product
 */
export function extractYieldFromProduct(product) {
  const attr = (product.attributes ?? []).find((row) => row.name === RENDIMIENTO_ATTR);
  if (!attr?.value?.trim()) return '';
  const raw = attr.value.replace(/,/g, '');
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : attr.value.trim();
}

/**
 * @param {Array<Record<string, unknown>>} products
 */
export function pickPrimaryTonerProduct(products) {
  return (
    products.find((row) => row.category === CATEGORY_TONER) ??
    products[0]
  );
}

/**
 * @param {Record<string, unknown>} a
 * @param {Record<string, unknown>} b
 */
function mergeNumericField(a, b) {
  const left = Number(a);
  const right = Number(b);
  if (!Number.isFinite(left) || left <= 0) return right;
  if (!Number.isFinite(right) || right <= 0) return left;
  return Math.max(left, right);
}

/**
 * @param {Array<Record<string, unknown>>} group
 */
export function mergeTonerProductsByCode(group) {
  if (!group.length) return null;
  if (group.length === 1) {
    const single = group[0];
    return normalizeProductInput({
      ...single,
      category: CATEGORY_TONER,
    });
  }

  const primary = pickPrimaryTonerProduct(group);
  const modelos = concatenateRicohModelos(group.map((row) => extractModeloFromProduct(row)));

  const baseTitle =
    group
      .map((row) => stripYieldSuffixFromName(String(row.name ?? '')))
      .sort((a, b) => b.length - a.length)[0] ?? stripYieldSuffixFromName(String(primary.name ?? ''));

  const yieldSource =
    group.find((row) => extractYieldFromProduct(row) !== '') ?? primary;
  const yieldValue = extractYieldFromProduct(yieldSource);

  const name = buildRicohLpProductName({
    titulo: baseTitle,
    yield: yieldValue,
    modelos,
  });

  /** @type {Array<{ name: string; value: string; id?: string }>} */
  const nextAttributes = [...(primary.attributes ?? [])].filter(
    (row) => row.name !== MODELO_ATTR && row.name !== RENDIMIENTO_ATTR,
  );

  if (modelos) {
    nextAttributes.push({ name: MODELO_ATTR, value: modelos });
  }
  const rendLabel = formatRendLabel(yieldValue);
  if (rendLabel && Number(String(yieldValue).replace(/,/g, '')) > 0) {
    nextAttributes.push({ name: RENDIMIENTO_ATTR, value: rendLabel });
  }

  const prices = { ...(primary.prices ?? {}) };
  for (const row of group) {
    const rowPrices = row.prices ?? {};
    prices.public = mergeNumericField(prices.public, rowPrices.public);
    prices.tecnico = mergeNumericField(prices.tecnico, rowPrices.tecnico);
    prices.distribuidor = mergeNumericField(prices.distribuidor, rowPrices.distribuidor);
    prices.mayorista = mergeNumericField(prices.mayorista, rowPrices.mayorista);
  }

  const purchase_price_usd = mergeNumericField(
    primary.purchase_price_usd,
    ...group.map((row) => row.purchase_price_usd),
  );

  /** @type {Map<string, { name: string; purchase_price_usd: number }>} */
  const supplierByName = new Map();
  for (const row of group) {
    for (const supplier of row.suppliers ?? []) {
      const supplierName = String(supplier.name ?? '').trim();
      if (!supplierName) continue;
      const prev = supplierByName.get(supplierName);
      const price = Number(supplier.purchase_price_usd);
      if (!prev || (Number.isFinite(price) && price > prev.purchase_price_usd)) {
        supplierByName.set(supplierName, {
          name: supplierName,
          purchase_price_usd: Number.isFinite(price) ? price : 0,
        });
      }
    }
  }

  return normalizeProductInput({
    ...primary,
    category: CATEGORY_TONER,
    name,
    description: name,
    prices,
    purchase_price_usd,
    attributes: normalizeAttributes(nextAttributes),
    suppliers: [...supplierByName.values()],
    stock: Math.max(...group.map((row) => Number(row.stock) || 0)),
    stock_by_warehouse: primary.stock_by_warehouse ?? group.find((row) => row.stock_by_warehouse)?.stock_by_warehouse,
    gallery:
      primary.gallery?.length > 0
        ? primary.gallery
        : (group.find((row) => row.gallery?.length)?.gallery ?? primary.gallery),
    image_url: primary.image_url ?? group.find((row) => row.image_url)?.image_url,
  });
}

/**
 * @param {Array<Record<string, unknown>>} products
 */
export function mergeTonerOriginalesIntoToner(products) {
  const tonerCategories = new Set([CATEGORY_TONER]);
  /** @type {Map<string, Array<Record<string, unknown>>>} */
  const byCode = new Map();
  /** @type {Array<Record<string, unknown>>} */
  const untouched = [];

  for (const product of products) {
    if (!tonerCategories.has(String(product.category ?? ''))) {
      untouched.push(product);
      continue;
    }

    const code = String(product.code ?? '').trim().toLowerCase();
    if (!code) {
      untouched.push({
        ...product,
        category: CATEGORY_TONER,
      });
      continue;
    }

    const bucket = byCode.get(code);
    if (bucket) {
      bucket.push(product);
    } else {
      byCode.set(code, [product]);
    }
  }

  /** @type {Array<Record<string, unknown>>} */
  const merged = [];
  let fusedByCode = 0;
  let movedFromOriginales = 0;

  for (const group of byCode.values()) {
    const hadDuplicate = group.length > 1;
    if (hadDuplicate) fusedByCode += 1;

    const product = mergeTonerProductsByCode(group);
    if (product) merged.push(product);
  }

  return {
    products: [...untouched, ...merged],
    stats: {
      tonerGroups: byCode.size,
      fusedByCode,
      movedFromOriginales,
      removedDuplicates: products.filter((p) => tonerCategories.has(String(p.category ?? ''))).length - merged.length,
    },
  };
}
