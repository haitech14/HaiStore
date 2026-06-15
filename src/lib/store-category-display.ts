import type { StoreCategory, StoreCategoryTreeNode } from '@/types/store-category';
import { subcategoryVisualKind } from '@/lib/subcategory-visual';

/** Subcategoría «Nuevas» por defecto en equipos (p. ej. multifuncionales). */
export function findDefaultNewSubcategorySlug(
  storeCategory: StoreCategoryTreeNode | undefined,
): string | null {
  if (!storeCategory?.children?.length) return null;
  const nuevas = storeCategory.children.find(
    (child) => subcategoryVisualKind(child.name) === 'new',
  );
  return nuevas?.slug ?? null;
}

export function findStoreCategoryBySlug(
  nodes: StoreCategoryTreeNode[],
  slug: string,
): StoreCategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    const nested = findStoreCategoryBySlug(node.children ?? [], slug);
    if (nested) return nested;
  }
  return undefined;
}

export function collectInventoryLabels(category: StoreCategory): string[] {
  const labels = new Set<string>();
  for (const label of category.inventoryLabels ?? []) {
    if (label.trim()) labels.add(label.trim());
  }
  for (const child of category.children ?? []) {
    for (const label of collectInventoryLabels(child)) labels.add(label);
  }
  return [...labels];
}

/** Etiqueta corta para tabs (p. ej. «Multifuncionales Nuevas» → «Nuevas»). */
export function formatSubcategoryTabLabel(name: string, parentName?: string | null): string {
  if (!parentName?.trim()) return name;
  const prefix = `${parentName.trim()} `;
  if (name.startsWith(prefix)) return name.slice(prefix.length);
  return name;
}
