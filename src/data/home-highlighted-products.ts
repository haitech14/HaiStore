/** Orden de modelos en la fila «Lo más destacado» (IM 430F/550F/600F primero). */
export const HOME_HIGHLIGHTED_MODEL_PATTERNS: readonly RegExp[] = [
  /\bim\s*430\s*f\b/i,
  /\bim\s*550\s*f\b/i,
  /\bim\s*600\s*f\b/i,
  /\bim\s*5000\b/i,
  /\bim\s*c320\s*f\b/i,
  /\bp\s*c600\b/i,
  /\bm\s*c320\s*fw\b/i,
];

export const HOME_HIGHLIGHTED_ROW_SIZE = 5;
export const MIN_HOME_FEATURED = 3;
