/** Modelos destacados al inicio de cada subsección B/N del catálogo por formato. */
export const CATALOG_FORMAT_BN_SUBSECTION_SPOTLIGHTS: Readonly<
  Record<'bn-a3' | 'bn-a4', readonly RegExp[]>
> = {
  'bn-a3': [/\bmp\s*305\s*\+/i, /\bim\s*460\s*f\b/i],
  'bn-a4': [/\bmp\s*4054\b/i, /\bim\s*430\s*f\b/i],
};
