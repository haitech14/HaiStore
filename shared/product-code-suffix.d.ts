export interface ProductCodeSuffixContext {
  category?: string | null;
  name?: string | null;
  isToner?: boolean;
}

export function isTonerProductContext(context?: ProductCodeSuffixContext): boolean;
export function shouldUseSnProductCodeSuffix(context?: ProductCodeSuffixContext): boolean;
export function shouldUseBaseOnlyProductCode(context?: ProductCodeSuffixContext): boolean;
export function isCompoundNumericInventoryCode(code: string): boolean;
export function resolveSimplifiedInventoryProductCode(
  code: string,
  context?: ProductCodeSuffixContext,
): string;
export function normalizeProductCodeSuffix(
  code: string,
  context?: ProductCodeSuffixContext,
): string;
