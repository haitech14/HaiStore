/** Prefijos de importación que no deben persistir en el campo `code`. */
const PRODUCT_CODE_PREFIX_PATTERNS = [/^REPUESTO/i, /^RICOHLP/i, /^LP-/i, /^LP(?=[A-Z0-9])/i];

/**
 * Quita prefijos REPUESTO / RICOHLP del código (p. ej. REPUESTOD0E12225 → D0E12225).
 * @param {string} code
 */
export function stripProductCodePrefix(code) {
  let result = String(code ?? '').trim();
  if (!result) return result;

  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of PRODUCT_CODE_PREFIX_PATTERNS) {
      const next = result.replace(pattern, '').trim();
      if (next !== result) {
        result = next;
        changed = true;
      }
    }
  }

  return result;
}

/**
 * Código normalizado para inventario e importaciones.
 * @param {string | null | undefined} code
 */
export function normalizeProductCode(code) {
  const raw = String(code ?? '').trim();
  if (!raw) return '';
  const stripped = stripProductCodePrefix(raw);
  return stripped || raw;
}
