const MODEL_PPM_PATTERNS = [
  /\bMP\s+C\s*(\d{2})\d*/i,
  /\bMP\s+(\d{2})\d*/i,
  /\bIM\s+C\s*(\d{2})\d*/i,
  /\bIM\s+(\d{2})\d*/i,
];

/**
 * Extrae los dos primeros dígitos del modelo tras MP / MP C / IM / IM C.
 * @param {string} name
 * @returns {string | null} Dígitos de ppm (p. ej. «30» para MP C307).
 */
export function inferPpmDigitsFromRicohModelName(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) return null;

  for (const pattern of MODEL_PPM_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * @param {string | null | undefined} ppmDigits
 */
export function formatPpmLabel(ppmDigits) {
  const digits = String(ppmDigits ?? '').trim();
  return digits ? `${digits} ppm` : null;
}

/**
 * @param {string} name
 */
export function inferPpmLabelFromRicohModelName(name) {
  return formatPpmLabel(inferPpmDigitsFromRicohModelName(name));
}

/**
 * @param {{ category?: string | null; name?: string | null }} product
 */
export function isMultifuncionalNuevaOSeminueva(product) {
  const category = String(product?.category ?? '').toLowerCase();
  const name = String(product?.name ?? '').toLowerCase();
  const isMultifunc =
    category.includes('multifuncional') || /\bmultifuncional\b/i.test(name);
  if (!isMultifunc) return false;

  return (
    category.includes('nueva') ||
    category.includes('seminueva') ||
    /\bnueva\b/.test(name) ||
    /\bseminueva\b/.test(name)
  );
}

/**
 * Velocidad para multifuncionales nuevas/seminuevas según modelo Ricoh.
 * @param {{ category?: string | null; name?: string | null }}
 */
export function resolveMultifuncionalVelocidadFromModel(product) {
  if (!isMultifuncionalNuevaOSeminueva(product)) return null;
  return inferPpmLabelFromRicohModelName(product?.name ?? '');
}
