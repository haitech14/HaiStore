import { categories, type Category } from '@/data/categories';
import { collectInventoryLabels } from '@/lib/store-category-display';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export function getCategoryProductLabels(category: Category): readonly string[] {
  if (category.inventoryCategories?.length) {
    return category.inventoryCategories;
  }
  return [category.name];
}

export function findCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

/** Etiquetas de inventario para filtrar productos en `/categoria/:slug` (estáticas + árbol de tienda). */
export function resolveCategoryPageProductLabels(
  category: Category,
  storeCategory: StoreCategoryTreeNode | undefined,
  subSlug: string | null,
): string[] {
  const staticLabels = [...getCategoryProductLabels(category)];

  if (storeCategory && subSlug) {
    const sub = storeCategory.children?.find((row) => row.slug === subSlug);
    if (sub) {
      const subLabels = sub.inventoryLabels?.length ? [...sub.inventoryLabels] : [sub.name];
      return [...new Set([...subLabels, ...staticLabels])];
    }
  }

  const treeLabels = storeCategory ? collectInventoryLabels(storeCategory) : [];
  const merged = [...new Set([...staticLabels, ...treeLabels])];
  return merged.length > 0 ? merged : staticLabels;
}
