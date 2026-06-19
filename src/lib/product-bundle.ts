export const TONER_PACK_LABEL = 'Pack x04';
export const TONER_PACK_TYPE_VALUE = 'Pack x04';

export interface ProductBundleComponent {
  product_id: string;
  quantity: number;
}

type BundleProductSource = {
  bundle_components?: ProductBundleComponent[] | null;
  name?: string;
};

export function normalizeBundleComponents(
  value: ProductBundleComponent[] | null | undefined,
): ProductBundleComponent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const product_id = String(row?.product_id ?? '').trim();
      const quantity = Math.max(1, Math.floor(Number(row?.quantity) || 1));
      if (!product_id) return null;
      return { product_id, quantity };
    })
    .filter((row): row is ProductBundleComponent => row !== null);
}

export function isBundleProduct(product: BundleProductSource | null | undefined): boolean {
  return normalizeBundleComponents(product?.bundle_components).length > 0;
}

export function isTonerPackProduct(product: BundleProductSource | null | undefined): boolean {
  if (isBundleProduct(product)) return true;
  return /\bPack x04\b/i.test(String(product?.name ?? ''));
}
