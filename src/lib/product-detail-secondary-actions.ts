import { isPrinterEquipment } from '@/lib/build-product-detail';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import {
  isPrinterEquipmentProduct,
  productMatchesCatalogFamily,
  productMatchesCondition,
  type ProductCondition,
} from '@/lib/product-condition';
import type { Product } from '@/types/product';

/** Multifuncionales / impresoras nuevas o seminuevas. */
export function productQualifiesForRentalCta(product: Product): boolean {
  if (!isPrinterEquipment(product)) return false;
  return (
    productQualifiesAsNuevaEquipment(product) ||
    productQualifiesAsSeminuevaEquipment(product)
  );
}

function resolveSupplyCatalogFamily(
  product: Product,
): 'toner-suministros' | 'repuestos' | null {
  if (productMatchesCatalogFamily(product, 'toner-suministros')) {
    return 'toner-suministros';
  }
  if (
    productMatchesCatalogFamily(product, 'repuestos') &&
    !isPrinterEquipmentProduct(product)
  ) {
    return 'repuestos';
  }
  return null;
}

function resolveSupplyCondition(
  product: Product,
  family: 'toner-suministros' | 'repuestos',
): ProductCondition | null {
  const conditions: ProductCondition[] = [
    'originales',
    'compatibles',
    'remanufacturados',
    'partes',
  ];
  for (const condition of conditions) {
    if (productMatchesCondition(product, condition, family)) {
      return condition;
    }
  }
  return null;
}

/** Tóner o repuestos originales / compatibles. */
export function productQualifiesForMaintenancePlanCta(product: Product): boolean {
  void product;
  return false;
}
