import { applyEquipmentSubcategorySlugFilter } from '@/lib/equipment-subcategory-filter';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { isPrinterEquipmentProduct, productMatchesCatalogFamily } from '@/lib/product-condition';
import { collectInventoryLabels } from '@/lib/store-category-display';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export function countProductsForCategoryNode(
  node: StoreCategoryTreeNode,
  products: readonly Product[],
  options?: { repuestosFamily?: boolean },
): number {
  if (node.slug === 'sin-categoria') {
    return products.filter((product) => !String(product.category ?? '').trim()).length;
  }
  if (node.slug === 'impresoras' || node.slug.startsWith('impresoras-')) {
    const matched = products.filter((product) => productMatchesCatalogFamily(product, 'impresoras'));
    const filtered = applyEquipmentSubcategorySlugFilter(matched, node.parentId ? node.slug : null);
    return filtered.length;
  }

  let labels = collectInventoryLabels(node);
  if (labels.length === 0 && node.name.trim()) {
    labels = [node.name.trim()];
  }
  if (labels.length === 0) return 0;

  const repuestosFamily = options?.repuestosFamily ?? node.slug === 'repuestos';

  let matched = products.filter((product) => {
    if (repuestosFamily && isPrinterEquipmentProduct(product)) {
      return false;
    }
    return labels.some((label) => productMatchesCategoryFilter(product, label));
  });

  // Solo aplicar filtro de subcategoría cuando el slug es uno de los subs de equipo.
  // Para slugs raíz como `impresoras` o `multifuncionales` no debe filtrar.
  matched = applyEquipmentSubcategorySlugFilter(matched, node.parentId ? node.slug : null);
  return matched.length;
}

function syncNodeProductCounts(
  node: StoreCategoryTreeNode,
  products: readonly Product[],
  repuestosFamily: boolean,
): StoreCategoryTreeNode {
  const children = (node.children ?? []) as StoreCategoryTreeNode[];
  const inRepuestosFamily = repuestosFamily || node.slug === 'repuestos';

  if (children.length > 0) {
    const syncedChildren = children.map((child) =>
      syncNodeProductCounts(child, products, inRepuestosFamily),
    );
    const productCount = syncedChildren.reduce(
      (sum, child) => sum + (child.productCount ?? 0),
      0,
    );
    return {
      ...node,
      children: syncedChildren,
      productCount,
    };
  }

  return {
    ...node,
    children: [],
    productCount: countProductsForCategoryNode(node, products, {
      repuestosFamily: inRepuestosFamily,
    }),
  };
}

export function syncStoreCategoryTreeProductCounts(
  tree: StoreCategoryTreeNode[],
  products: readonly Product[],
): StoreCategoryTreeNode[] {
  if (tree.length === 0) return tree;
  return tree.map((node) => syncNodeProductCounts(node, products, node.slug === 'repuestos'));
}
