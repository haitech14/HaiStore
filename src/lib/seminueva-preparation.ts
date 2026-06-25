import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { productQualifiesAsSeminuevaEquipment } from '@/lib/inventory-product-name';
import { buildEquipmentCartLineId, type SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import type { Product } from '@/types/product';
import type { UserRole } from '@/lib/roles';

export type SeminuevaPreparationType = 'acondicionada' | 'semirepotenciada';

export const SEMINUEVA_PREPARATION_LABELS: Record<SeminuevaPreparationType, string> = {
  acondicionada: 'Acondicionada',
  semirepotenciada: 'Semirepotenciada',
};

const SEMINUEVA_PREPARATION_CATEGORY_HINTS = [
  'multifuncionales seminuevas',
  'impresoras laser seminuevas',
  'impresoras láser seminuevas',
] as const;

const SEMIREPOTENCIADA_SURCHARGE_USD = {
  bn: 250,
  color: 350,
} as const;

export function productQualifiesForSeminuevaPreparation(product: Product): boolean {
  if (!productQualifiesAsSeminuevaEquipment(product)) return false;
  const category = String(product.category ?? '').toLowerCase();
  return SEMINUEVA_PREPARATION_CATEGORY_HINTS.some((hint) => category.includes(hint));
}

export function shouldShowSeminuevaPreparationSelector(
  product: Product,
  role: UserRole | 'public',
  viewAsRoles: readonly UserRole[],
): boolean {
  if (role !== 'public' || viewAsRoles.length > 0) return false;
  return productQualifiesForSeminuevaPreparation(product);
}

export function resolveSeminuevaPreparationSurchargeUsd(
  preparationType: SeminuevaPreparationType,
  product: Product,
): number {
  if (preparationType !== 'semirepotenciada') return 0;
  return isColorPrinterEquipment(product)
    ? SEMIREPOTENCIADA_SURCHARGE_USD.color
    : SEMIREPOTENCIADA_SURCHARGE_USD.bn;
}

export function resolvePublicUnitBaseWithPreparationUsd(
  publicPriceUsd: number,
  preparationType: SeminuevaPreparationType,
  product: Product,
): number {
  return publicPriceUsd + resolveSeminuevaPreparationSurchargeUsd(preparationType, product);
}

export function buildCartLineId(
  productId: string,
  paidOptions: SelectedEquipmentOption[],
  preparationType?: SeminuevaPreparationType,
): string {
  const base = buildEquipmentCartLineId(productId, paidOptions);
  if (preparationType === 'semirepotenciada') {
    return `${base}::prep:semirepotenciada`;
  }
  return base;
}
