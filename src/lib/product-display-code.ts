import { stripProductCodePrefix } from '../../shared/product-code-prefix.js';
import {
  normalizeProductCodeSuffix,
  type ProductCodeSuffixContext,
} from '../../shared/product-code-suffix.js';

/** Quita prefijos REPUESTO/RICOHLP/LP del código para mostrar en UI. */
export function stripProductCodeDisplayPrefix(code: string): string {
  const result = stripProductCodePrefix(code);
  return result || code.trim();
}

export type { ProductCodeSuffixContext };

export interface FormatProductDisplayCodeOptions extends ProductCodeSuffixContext {
  brand?: string | null | undefined;
}

/**
 * Código listo para UI: sin prefijos REPUESTO/RICOHLP/LP ni marca duplicada al inicio.
 * Sufijos Ricoh tipo CP908Y → «-CP» (tóner) o «-SN» (repuestos similares).
 * La búsqueda sigue usando el código crudo del inventario.
 */
export function formatProductDisplayCode(
  code: string | null | undefined,
  options: FormatProductDisplayCodeOptions = {},
): string | null {
  const raw = code?.trim();
  if (!raw) return null;

  let cleaned = stripProductCodeDisplayPrefix(raw);

  const brand = options.brand?.trim();
  if (brand) {
    const brandUpper = brand.toUpperCase();
    if (cleaned.toUpperCase().startsWith(brandUpper)) {
      cleaned = cleaned.slice(brand.length).trim();
    }
  }

  cleaned = normalizeProductCodeSuffix(cleaned, options);

  return cleaned || raw;
}
