export const DEFAULT_USD_TO_PEN_SEO: number;

/** Entrada flexible para helpers SEO (catálogo, inventario, API). */
export type ProductSeoInput = {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | null | undefined;
  code?: string | null | undefined;
  brand?: string | null | undefined;
  category?: string | null | undefined;
  price?: number | undefined;
  prices?: unknown;
  image_url?: string | null | undefined;
  gallery?: string[] | undefined;
  stock?: number | undefined;
  attributes?: unknown;
  slug?: string | null | undefined;
};

export function usdToPenSeo(usd: number, rate?: number): number;
export function isPrinterProductSeo(product: ProductSeoInput): boolean;
export function resolveProductHeroBrandSeo(product: ProductSeoInput): string | null;
export function resolveProductHeroCodeSeo(product: ProductSeoInput): string | null;
export function resolveProductEquipmentConditionLabelSeo(product: ProductSeoInput): string | null;
export function resolveSchemaItemCondition(product: ProductSeoInput): string;
export function extractProductModel(product: ProductSeoInput): string | null;
export function formatProductPageTitleSeo(product: ProductSeoInput): string;
export function cleanProductInventoryDescription(product: ProductSeoInput): string;
export function hasProductInventoryDescription(product: ProductSeoInput): boolean;
export function buildProductMetaDescriptionSeo(
  product: ProductSeoInput,
  options?: Record<string, unknown>,
): string;
export function buildProductSeoBodyParagraph(product: ProductSeoInput): string | null;
export function buildProductOgProductMeta(product: ProductSeoInput): {
  priceAmount: string | null;
  priceCurrency: string;
  priceAmountPen: string | null;
  availability: string;
  brand: string;
  retailerItemId: string;
};
export function suggestProductSlug(product: ProductSeoInput): string;
export function priceValidUntilSeo(daysAhead?: number): string;
