/** Sufijos Ricoh tipo CP908Y / CP908M (modelo + color). */
const CP_COLOR_SUFFIX_PATTERN = /^CP\d{3}[A-Z]$/i;

/** Código numérico + sufijo CP###X: 418460-CP908Y */
const NUMERIC_CP_COLOR_SUFFIX_PATTERN = /^(\d+)-CP\d{3}[A-Z]$/i;

/** Variante sin guion: 418460CP908Y */
const EMBEDDED_NUMERIC_CP_COLOR_PATTERN = /^(\d{6,})CP\d{3}[A-Z]$/i;

/** Orden invertido: CP908Y-418460 */
const REVERSED_CP_COLOR_SUFFIX_PATTERN = /^CP\d{3}[A-Z]-(\d+)$/i;

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

/**
 * Normaliza sufijos CP908Y y similares: primero el código numérico, luego el guion.
 * Tóner → sufijo «CP»; resto de consumibles/repuestos similares → «SN».
 *
 * @param {string} code
 * @param {{ category?: string | null; name?: string | null; isToner?: boolean }} [context]
 */
export function normalizeProductCodeSuffix(code, context = {}) {
  const value = String(code ?? '').trim();
  if (!value) return value;

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
