import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import type { Product } from '@/types/product';

const NUEVAS_EQUIPMENT_SUBSLUGS = new Set([
  'multifuncionales-nuevas',
  'impresoras-laser-nuevas',
]);

const SEMINUEVAS_EQUIPMENT_SUBSLUGS = new Set([
  'multifuncionales-seminuevas',
  'impresoras-laser-seminuevas',
]);

/** Filtra por condición real del equipo (nombre «NUEVA» / «seminueva») en subcategorías de equipos. */
export function applyEquipmentSubcategorySlugFilter<T extends Product>(
  products: readonly T[],
  subSlug: string | null | undefined,
): T[] {
  if (!subSlug) return [...products];
  if (NUEVAS_EQUIPMENT_SUBSLUGS.has(subSlug)) {
    return products.filter(productQualifiesAsNuevaEquipment);
  }
  if (SEMINUEVAS_EQUIPMENT_SUBSLUGS.has(subSlug)) {
    return products.filter(productQualifiesAsSeminuevaEquipment);
  }
  return [...products];
}
