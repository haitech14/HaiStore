import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { isPrinterEquipment } from '@/lib/build-product-detail';
import { resolveProductCategoryPlacement } from '@/lib/inventory-product-category';
import { flattenCategoryTree } from '@/lib/store-category-tree';
import type { ProductBreadcrumb } from '@/types/product-detail';
import type { Product } from '@/types/product';
import type { StoreCategory, StoreCategoryTreeNode } from '@/types/store-category';

function isMonochromePrinter(product: Product): boolean {
  const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
  return (
    !haystack.includes('color') &&
    !haystack.includes('a color') &&
    !/\bim\s+c\d{3,4}/i.test(product.name) &&
    !/\bm\s+c\d/i.test(product.name)
  );
}

function findCategoryChain(
  tree: StoreCategoryTreeNode[],
  categoryLabel: string | null | undefined,
): StoreCategory[] {
  const placement = resolveProductCategoryPlacement(tree, categoryLabel);
  const target = placement.sub ?? placement.parent;
  if (!target) return [];

  const flat = flattenCategoryTree(tree);
  const chain: StoreCategory[] = [];
  let current: StoreCategory | undefined = target;

  while (current) {
    chain.unshift(current);
    current = current.parentId
      ? flat.find((node) => node.id === current!.parentId)
      : undefined;
  }

  return chain;
}

function categoryCrumbHref(chain: StoreCategory[], index: number): string {
  const node = chain[index];
  if (!node) return '/tienda';

  if (index === 0) {
    return categoryLandingPath(node.slug);
  }

  const root = chain[0];
  return categoryPath(root.slug, node.slug);
}

function appendPrinterFallbackCrumbs(
  crumbs: ProductBreadcrumb[],
  product: Product,
): void {
  if (crumbs.length > 2) return;

  crumbs.push({
    label: 'Impresoras y Multifuncionales',
    href: categoryLandingPath('multifuncionales'),
  });

  if (isMonochromePrinter(product)) {
    crumbs.push({
      label: 'Multifuncionales Monocromáticas',
      href: categoryPath('multifuncionales'),
    });
  }
}

export function buildProductBreadcrumbs(
  product: Product,
  displayTitle: string,
  categoryTree: StoreCategoryTreeNode[] = [],
): ProductBreadcrumb[] {
  const crumbs: ProductBreadcrumb[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/tienda' },
  ];

  const chain = findCategoryChain(categoryTree, product.category);

  for (let index = 0; index < chain.length; index += 1) {
    const node = chain[index];
    crumbs.push({
      label: node.name,
      href: categoryCrumbHref(chain, index),
    });
  }

  if (chain.length === 0 && isPrinterEquipment(product)) {
    appendPrinterFallbackCrumbs(crumbs, product);
  } else if (chain.length === 0 && product.category?.trim()) {
    crumbs.push({
      label: product.category.trim(),
      href: '/tienda',
    });
  }

  crumbs.push({ label: displayTitle });

  return crumbs;
}
