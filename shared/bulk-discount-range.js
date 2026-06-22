function isLegacyRangeFormat(range) {
  return /^\d+\s*-\s*\d+$/i.test(String(range).trim().replace(/^compra\s+/i, ''));
}

export function parseBulkDiscountRange(range) {
  const normalized = String(range ?? '').trim().replace(/^compra\s+/i, '');
  const plusMatch = normalized.match(/^(\d+)\+$/i);
  if (plusMatch) {
    return { min: Number(plusMatch[1]), max: Number.POSITIVE_INFINITY };
  }

  const rangeMatch = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }

  const singleMatch = normalized.match(/^(\d+)$/);
  if (singleMatch) {
    const value = Number(singleMatch[1]);
    return { min: value, max: value };
  }

  return null;
}

export function tierQualifiesForQuantity(quantity, range) {
  const bounds = parseBulkDiscountRange(range);
  if (!bounds) return false;

  if (isLegacyRangeFormat(range)) {
    return quantity >= bounds.min && quantity <= bounds.max;
  }

  return quantity >= bounds.min;
}
