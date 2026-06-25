import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from './inventory-product-name.js';

/** Sufijos Ricoh tipo CP908Y / CP908M (modelo + color). */
const CP_COLOR_SUFFIX_PATTERN = /^CP\d{3}[A-Z]$/i;

/** Código numérico + sufijo CP###X: 418460-CP908Y */
const NUMERIC_CP_COLOR_SUFFIX_PATTERN = /^(\d+)-CP\d{3}[A-Z]$/i;

/** Variante sin guion: 418460CP908Y */
const EMBEDDED_NUMERIC_CP_COLOR_PATTERN = /^(\d{6,})CP\d{3}[A-Z]$/i;

/** Orden invertido: CP908Y-418460 */
const REVERSED_CP_COLOR_SUFFIX_PATTERN = /^CP\d{3}[A-Z]-(\d+)$/i;

/** Inventario Ricoh: 418843-CP8Y1I-CP… (código base + etiquetas internas). */
const COMPOUND_NUMERIC_INVENTORY_CODE_PATTERN = /^(\d{5,})-/;

/**
 * @param {{ category?: string | null; name?: string | null; isToner?: boolean }} [context]
 */
export function isTonerProductContext(context = {}) {
  if (context.isToner === true) return true;
  if (context.isToner === false) return false;

  const haystack = `${context.category ?? ''} ${context.name ?? ''}`.toLowerCase();
  return (
    /\btoner\b|\btóner\b|\bcartucho\b|print\s*cartrid|toner\s+original|toner\s+compatible/i.test(
      haystack,
    )
  );
}

function productHaystack(context = {}) {
  return `${context.category ?? ''} ${context.name ?? ''}`.toLowerCase();
}

/**
 * @param {{ category?: string | null; name?: string | null }} context
 */
export function shouldUseSnProductCodeSuffix(context = {}) {
  const product = { name: context.name, category: context.category };
  if (productQualifiesAsSeminuevaEquipment(product)) return true;
  if (productQualifiesAsRemanufacturadaEquipment(product)) return true;

  const haystack = productHaystack(context);
  if (/\bcompatible\b|\bcompatibles\b/i.test(haystack)) return true;
  if (/\bseminuev|\bsemi-nuev|\bsemi nuev/i.test(haystack)) return true;
  if (/\bremanufacturad/i.test(haystack)) return true;

  return false;
}

/**
 * @param {{ category?: string | null; name?: string | null }} context
 */
export function shouldUseBaseOnlyProductCode(context = {}) {
  const product = { name: context.name, category: context.category };
  if (productQualifiesAsSeminuevaEquipment(product)) return false;
  if (productQualifiesAsNuevaEquipment(product)) return true;

  const haystack = productHaystack(context);
  if (/\boriginal\b|\boriginales\b/i.test(haystack)) return true;
  if (/\bnueva\b|\bnuevos\b/i.test(haystack)) return true;

  const category = String(context.category ?? '').toLowerCase();
  if (category.includes('nuevas') || category.includes('nuevos')) return true;
  if (category.includes('original')) return true;

  return false;
}

/**
 * @param {string} code
 */
export function isCompoundNumericInventoryCode(code) {
  return COMPOUND_NUMERIC_INVENTORY_CODE_PATTERN.test(String(code ?? '').trim());
}

/**
 * 418843-CP8Y1I-… → 418843 (nueva/original) o 418843-SN (seminueva/compatible).
 *
 * @param {string} code
 * @param {{ category?: string | null; name?: string | null; isToner?: boolean }} [context]
 */
export function resolveSimplifiedInventoryProductCode(code, context = {}) {
  const value = String(code ?? '').trim();
  if (!value) return value;

  const compound = value.match(/^(\d{5,})(?:-(.*))?$/);
  if (!compound) return value;

  const base = compound[1];
  const suffix = compound[2];

  if (!suffix) return base;
  if (suffix === 'SN') return `${base}-SN`;

  if (shouldUseSnProductCodeSuffix(context)) return `${base}-SN`;
  if (shouldUseBaseOnlyProductCode(context)) return base;

  return base;
}

/**
 * Normaliza sufijos CP908Y y códigos compuestos 418843-CP….
 * Tóner original / equipo nueva → solo número; compatible / seminueva → «-SN».
 *
 * @param {string} code
 * @param {{ category?: string | null; name?: string | null; isToner?: boolean }} [context]
 */
export function normalizeProductCodeSuffix(code, context = {}) {
  const value = String(code ?? '').trim();
  if (!value) return value;

  if (isCompoundNumericInventoryCode(value)) {
    return resolveSimplifiedInventoryProductCode(value, context);
  }

  if (shouldUseSnProductCodeSuffix(context) || shouldUseBaseOnlyProductCode(context)) {
    const compound = value.match(NUMERIC_CP_COLOR_SUFFIX_PATTERN);
    if (compound) {
      return shouldUseSnProductCodeSuffix(context)
        ? `${compound[1]}-SN`
        : compound[1];
    }

    const embedded = value.match(EMBEDDED_NUMERIC_CP_COLOR_PATTERN);
    if (embedded) {
      return shouldUseSnProductCodeSuffix(context)
        ? `${embedded[1]}-SN`
        : embedded[1];
    }

    const reversed = value.match(REVERSED_CP_COLOR_SUFFIX_PATTERN);
    if (reversed) {
      return shouldUseSnProductCodeSuffix(context)
        ? `${reversed[1]}-SN`
        : reversed[1];
    }
  }

  const replacement = isTonerProductContext(context) ? 'CP' : 'SN';

  const compound = value.match(NUMERIC_CP_COLOR_SUFFIX_PATTERN);
  if (compound) {
    return `${compound[1]}-${replacement}`;
  }

  const embedded = value.match(EMBEDDED_NUMERIC_CP_COLOR_PATTERN);
  if (embedded) {
    return `${embedded[1]}-${replacement}`;
  }

  const reversed = value.match(REVERSED_CP_COLOR_SUFFIX_PATTERN);
  if (reversed) {
    return `${reversed[1]}-${replacement}`;
  }

  if (CP_COLOR_SUFFIX_PATTERN.test(value)) {
    return replacement;
  }

  return value;
}
