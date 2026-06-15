import { useMemo } from 'react';

import { ProductHighlightCard } from '@/components/product/product-highlight-card';
import { Skeleton } from '@/components/ui/skeleton';
import { categories } from '@/data/categories';
import { useProducts } from '@/hooks/use-products';
import { getCategoryProductLabels } from '@/lib/category-product-labels';
import {
  filterInStockProductsForCategoryLabels,
  HOME_HIGHLIGHTED_ROW_SIZE,
  MIN_HOME_FEATURED,
  resolveHomeHighlightedRowProducts,
} from '@/lib/home-featured-products';
import { cn } from '@/lib/utils';

const HIGHLIGHT_CATEGORY_SLUG = 'multifuncionales';

const MOBILE_GRID_CLASS = 'grid grid-cols-2 gap-3 sm:grid-cols-3';

const DESKTOP_STRIP_CLASS =
  'xl:grid xl:grid-cols-6 xl:gap-0 xl:overflow-hidden xl:rounded-xl xl:border xl:border-border/50 xl:bg-white xl:shadow-[0_2px_12px_rgba(15,31,61,0.08)]';

export function HomeHighlightedSection() {
  const { data: products, isLoading, isError } = useProducts();

  const highlightedProducts = useMemo(() => {
    if (!products?.length) return [];

    const category = categories.find((item) => item.slug === HIGHLIGHT_CATEGORY_SLUG);
    if (!category) return [];

    const inCategory = filterInStockProductsForCategoryLabels(
      products,
      getCategoryProductLabels(category),
    );
    if (inCategory.length < MIN_HOME_FEATURED) return [];

    return resolveHomeHighlightedRowProducts(inCategory);
  }, [products]);

  if (!isLoading && highlightedProducts.length < MIN_HOME_FEATURED) {
    return null;
  }

  const lastIndex = highlightedProducts.length - 1;

  return (
    <section aria-labelledby="lo-mas-destacado-titulo" className="bg-white">
      <div className="container px-3 py-6 sm:px-4 sm:py-8">
        <h2
          id="lo-mas-destacado-titulo"
          className="mb-4 text-balance text-xl font-bold tracking-tight sm:mb-6 sm:text-2xl"
        >
          <span className="relative inline-block text-red-600">
            Lo
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-full bg-red-600"
              aria-hidden="true"
            />
          </span>
          <span className="text-[#0f1f3d]"> más destacado</span>
        </h2>

        {isError ? (
          <p role="alert" className="text-sm text-destructive">
            No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
          </p>
        ) : isLoading ? (
          <ul className={cn(MOBILE_GRID_CLASS, DESKTOP_STRIP_CLASS)}>
            {Array.from({ length: HOME_HIGHLIGHTED_ROW_SIZE }).map((_, index) => (
              <li
                key={index}
                className={cn(index > 0 && 'xl:border-l xl:border-border/50')}
              >
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-white p-2 shadow-sm xl:rounded-none xl:border-0 xl:shadow-none">
                  <Skeleton className="aspect-square w-full bg-neutral-100" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={cn(MOBILE_GRID_CLASS, DESKTOP_STRIP_CLASS)} role="list">
            {highlightedProducts.map((product, index) => (
              <li
                key={product.id}
                className={cn(
                  'min-w-0',
                  index > 0 && 'xl:border-l xl:border-border/50',
                  index === 0 && 'xl:rounded-l-xl',
                  index === lastIndex && 'xl:rounded-r-xl',
                )}
              >
                <ProductHighlightCard product={product} layout="strip" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
