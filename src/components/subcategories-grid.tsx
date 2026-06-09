import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SubcategoryTabs } from '@/components/subcategory-tabs';
import { scrollToCategoryProducts } from '@/lib/category-path';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

interface SubcategoriesGridProps {
  parentSlug: string;
  parentImage?: string | null;
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  products?: Product[];
  /** Si se define, no usa query params de la URL (p. ej. panel en inicio). */
  onSelectSub?: (subSlug: string | null) => void;
}

export function SubcategoriesGrid({
  subcategories,
  activeSubSlug,
  onSelectSub,
}: SubcategoriesGridProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectSubcategory = useCallback(
    (subSlug: string | null) => {
      if (onSelectSub) {
        onSelectSub(subSlug);
        return;
      }

      const next = new URLSearchParams(searchParams);
      if (subSlug) next.set('sub', subSlug);
      else next.delete('sub');
      setSearchParams(next, { replace: true, preventScrollReset: true });
      requestAnimationFrame(() => scrollToCategoryProducts('smooth'));
    },
    [onSelectSub, searchParams, setSearchParams],
  );

  return (
    <SubcategoryTabs
      subcategories={subcategories}
      activeSubSlug={activeSubSlug}
      onSelect={selectSubcategory}
    />
  );
}
