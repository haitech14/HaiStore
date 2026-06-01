import { useMemo } from 'react';

import { CatalogSectionWithTabs } from '@/components/catalog-section-with-tabs';
import { useProducts } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { collectInventoryLabels, findStoreCategoryBySlug } from '@/lib/store-category-display';
import {
  HOME_CATALOG_SECTIONS,
  resolveHomeSectionInventoryLabels,
} from '@/lib/home-catalog-sections';
import {
  PRODUCT_CONDITIONS,
  type ProductCondition,
} from '@/lib/product-condition';
import { filterStoreProductsForHomeSection } from '@/lib/store-products';

export function CatalogCategorySections() {
  const { data: storeProducts } = useProducts();
  const { data: categoryTree = [] } = useStoreCategoriesTree();

  const sections = useMemo(() => {
    if (!storeProducts?.length) return [];

    return HOME_CATALOG_SECTIONS.map((section) => {
      const treeLabels = section.inventoryCategorySlugs.flatMap((slug) => {
        const storeCategory = findStoreCategoryBySlug(categoryTree, slug);
        return storeCategory ? collectInventoryLabels(storeCategory) : [];
      });
      const staticLabels = resolveHomeSectionInventoryLabels(section);
      const categoryLabels = [...new Set([...staticLabels, ...treeLabels])];

      const productsByCondition = PRODUCT_CONDITIONS.reduce(
        (acc, condition) => {
          acc[condition] = filterStoreProductsForHomeSection(
            storeProducts,
            section.id,
            categoryLabels,
            condition,
          );
          return acc;
        },
        {} as Record<ProductCondition, ReturnType<typeof filterStoreProductsForHomeSection>>,
      );

      return { section, productsByCondition };
    }).filter(({ productsByCondition }) =>
      PRODUCT_CONDITIONS.some((key) => productsByCondition[key].length > 0),
    );
  }, [storeProducts, categoryTree]);

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      {sections.map(({ section, productsByCondition }) => (
        <CatalogSectionWithTabs
          key={section.id}
          section={section}
          productsByCondition={productsByCondition}
        />
      ))}
    </div>
  );
}
