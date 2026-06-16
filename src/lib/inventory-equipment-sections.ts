import {
  buildCatalogFormatSections,
  type CatalogFormatSectionGroup,
} from '@/lib/category-catalog-filters';
import { resolveCategoryFilterLabels } from '@/lib/inventory-categories';
import type { InventoryProduct, Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const EQUIPMENT_CATEGORY_PATTERN =
  /multifuncion|impresor|formato ancho|plotter|copiadora|esc[aá]ner/i;

export interface InventoryEquipmentSubsection {
  id: string;
  title: string;
  products: InventoryProduct[];
}

export interface InventoryEquipmentSectionGroup {
  id: CatalogFormatSectionGroup['id'];
  title: string;
  subsections: InventoryEquipmentSubsection[];
}

/** Muestra divisiones B/N · A4/A3 cuando el filtro apunta a equipos de impresión. */
export function shouldShowInventoryEquipmentSections(
  categoryFilter: string,
  categoryTree: StoreCategoryTreeNode[],
): boolean {
  if (categoryFilter === 'all') return false;
  const labels = resolveCategoryFilterLabels(categoryTree, categoryFilter);
  return labels.some((label) => EQUIPMENT_CATEGORY_PATTERN.test(label));
}

export function buildInventoryEquipmentSections(
  products: readonly InventoryProduct[],
): InventoryEquipmentSectionGroup[] {
  const catalogProducts = products as unknown as readonly Product[];
  return buildCatalogFormatSections(catalogProducts)
    .map((section) => ({
      id: section.id,
      title: section.title,
      subsections: section.subsections
        .filter((subsection) => subsection.products.length > 0)
        .map((subsection) => ({
          id: subsection.id,
          title: subsection.title,
          products: subsection.products as unknown as InventoryProduct[],
        })),
    }))
    .filter((section) => section.subsections.length > 0);
}

export function flattenInventoryEquipmentSections(
  sections: readonly InventoryEquipmentSectionGroup[],
): InventoryProduct[] {
  return sections.flatMap((section) =>
    section.subsections.flatMap((subsection) => subsection.products),
  );
}
