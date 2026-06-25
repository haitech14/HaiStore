import { isCompatibleTonerCategory } from './compatible-toner.js';

export const COMPATIBLE_TONER_NUMERIC_CODE_MIN = 901000;
export const COMPATIBLE_TONER_NUMERIC_CODE_MAX = 999999;

const PRESERVED_NUMERIC_SN_PATTERN = /^\d+-SN$/i;
const SIX_DIGIT_NUMERIC_PATTERN = /^\d{1,6}$/;

/**
 * @param {unknown} code
 */
export function shouldPreserveCompatibleTonerProductCode(code) {
  const value = String(code ?? '').trim();
  if (!value) return false;
  if (/^\d/.test(value)) return true;
  if (PRESERVED_NUMERIC_SN_PATTERN.test(value)) return true;
  return false;
}

/**
 * @param {{ category?: string | null; id?: string | null; code?: string | null; name?: string | null }} product
 */
export function isCompatibleTonerProduct(product) {
  if (isCompatibleTonerCategory(product?.category)) return true;

  const id = String(product?.id ?? '').trim().toLowerCase();
  if (id.startsWith('compat-')) return true;

  const haystack = `${product?.category ?? ''} ${product?.name ?? ''} ${product?.code ?? ''}`;
  if (!/\bcompatible\b|\bcompatibles\b/i.test(haystack)) return false;

  const code = String(product?.code ?? '').trim();
  if (/^TONERCOMPAT/i.test(code)) return true;
  if (/^(TC|TR|LP)-/i.test(code)) return true;

  return false;
}

/**
 * @param {unknown} code
 */
export function needsCompatibleTonerCodeReformulation(code) {
  const value = String(code ?? '').trim();
  if (!value) return true;
  if (shouldPreserveCompatibleTonerProductCode(value)) return false;
  if (SIX_DIGIT_NUMERIC_PATTERN.test(value)) return false;
  return true;
}

/**
 * @param {Iterable<{ code?: string | null }>} products
 */
export function collectReservedCompatibleTonerNumericCodes(products) {
  const used = new Set();
  for (const product of products) {
    const code = String(product?.code ?? '').trim();
    if (!code) continue;

    if (SIX_DIGIT_NUMERIC_PATTERN.test(code)) {
      used.add(code);
      continue;
    }

    const snMatch = code.match(/^(\d+)-SN$/i);
    if (snMatch?.[1]) {
      used.add(snMatch[1]);
    }
  }
  return used;
}

/**
 * @param {Set<string>} used
 */
export function allocateNextCompatibleTonerNumericCode(used) {
  for (let candidate = COMPATIBLE_TONER_NUMERIC_CODE_MIN; candidate <= COMPATIBLE_TONER_NUMERIC_CODE_MAX; candidate += 1) {
    const value = String(candidate);
    if (!used.has(value)) {
      used.add(value);
      return value;
    }
  }
  throw new Error('No hay códigos numéricos disponibles para tóner compatible (901000–999999).');
}

/**
 * Código estable por id cuando no hay contexto de lote (un solo producto).
 *
 * @param {unknown} seed
 * @param {Set<string>} [reserved]
 */
export function deriveCompatibleTonerNumericCode(seed, reserved = new Set()) {
  const seedText = String(seed ?? '').trim() || 'compat-sin-id';
  let hash = 0;
  for (let index = 0; index < seedText.length; index += 1) {
    hash = (hash * 33 + seedText.charCodeAt(index)) >>> 0;
  }

  const span = COMPATIBLE_TONER_NUMERIC_CODE_MAX - COMPATIBLE_TONER_NUMERIC_CODE_MIN + 1;
  let candidate = COMPATIBLE_TONER_NUMERIC_CODE_MIN + (hash % span);
  const used = new Set(reserved);

  while (used.has(String(candidate))) {
    candidate += 1;
    if (candidate > COMPATIBLE_TONER_NUMERIC_CODE_MAX) {
      candidate = COMPATIBLE_TONER_NUMERIC_CODE_MIN;
    }
  }

  const value = String(candidate);
  used.add(value);
  return value;
}

/**
 * @param {{ code?: string | null; id?: string | null; category?: string | null; name?: string | null }} product
 * @param {Set<string>} [reserved]
 */
export function normalizeCompatibleTonerProductCode(product, reserved = new Set()) {
  const current = String(product?.code ?? '').trim();

  if (!isCompatibleTonerProduct(product)) {
    return current;
  }

  if (shouldPreserveCompatibleTonerProductCode(current)) {
    return current;
  }

  if (SIX_DIGIT_NUMERIC_PATTERN.test(current)) {
    return current;
  }

  return deriveCompatibleTonerNumericCode(product?.id ?? current, reserved);
}

/**
 * @param {Array<{ id?: string; code?: string | null; category?: string | null; name?: string | null }>} products
 */
export function buildCompatibleTonerCodeAssignments(products) {
  const used = collectReservedCompatibleTonerNumericCodes(products);
  /** @type {Map<string, string>} */
  const assignments = new Map();

  const targets = products
    .filter((product) => isCompatibleTonerProduct(product))
    .filter((product) => needsCompatibleTonerCodeReformulation(product.code))
    .sort((a, b) => String(a.id).localeCompare(String(b.id), 'es'));

  for (const product of targets) {
    const id = String(product.id ?? '').trim();
    if (!id) continue;
    assignments.set(id, allocateNextCompatibleTonerNumericCode(used));
  }

  return assignments;
}
