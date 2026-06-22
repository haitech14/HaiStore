export interface ProductCodeSuffixContext {
  category?: string | null;
  name?: string | null;
  isToner?: boolean;
}

export function isTonerProductContext(context?: ProductCodeSuffixContext): boolean;
export function normalizeProductCodeSuffix(
  code: string,
  context?: ProductCodeSuffixContext,
): string;
