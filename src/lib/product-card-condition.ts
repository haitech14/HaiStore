import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import type { ProductEquipmentConditionLabel } from '@/lib/product-hero-meta';

export function resolveProductCardConditionLabel(
  product: ProductBadgeSource & { name: string; category?: string | null },
): ProductEquipmentConditionLabel | null {
  if (!isPrinterProduct(product)) return null;

  if (productQualifiesAsSeminuevaEquipment(product)) return 'Seminueva';
  if (productQualifiesAsRemanufacturadaEquipment(product)) return 'Remanufacturada';
  if (productQualifiesAsNuevaEquipment(product)) return 'Nueva';

  const category = (product.category ?? '').toLowerCase();
  if (category.includes('seminuevas') || category.includes('seminuevos')) return 'Seminueva';
  if (category.includes('remanufacturadas') || category.includes('remanufacturados')) {
    return 'Remanufacturada';
  }
  if (category.includes('nuevas') || category.includes('nuevos')) return 'Nueva';

  return null;
}
