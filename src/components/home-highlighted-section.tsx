import { useEffect, useMemo, useState } from 'react';

import { ProductHighlightCard } from '@/components/product/product-highlight-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { categories } from '@/data/categories';
import { useProducts } from '@/hooks/use-products';
import { getCategoryProductLabels } from '@/lib/category-product-labels';
import {
  countInStockProductsForCategoryLabels,
  filterInStockProductsForCategoryLabels,
  HOME_HIGHLIGHTED_ROW_SIZE,
  MIN_HOME_FEATURED,
  resolveHomeFeaturedProducts,
} from '@/lib/home-featured-products';
import { cn } from '@/lib/utils';

const HIGHLIGHT_ITEM_CLASS =
  'w-[calc(50%-0.375rem)] shrink-0 snap-start sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(20%-0.6rem)] xl:w-auto xl:min-w-0 xl:flex-1';

const HOME_HIGHLIGHT_CATEGORY_SLUGS = categories
  .filter((category) => category.slug !== 'servicio-tecnico')
  .map((category) => category.slug);

export function HomeHighlightedSection() {
  const { data: products, isLoading, isError } = useProducts();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);

  const categoryTabs = useMemo(() => {
    return HOME_HIGHLIGHT_CATEGORY_SLUGS.map((slug) => {
      const category = categories.find((item) => item.slug === slug);
      if (!category) return null;

      const labels = getCategoryProductLabels(category);
      const count = countInStockProductsForCategoryLabels(products, labels);

      return { slug, name: category.name, count };
    }).filter((tab): tab is NonNullable<typeof tab> => tab != null && tab.count >= MIN_HOME_FEATURED);
  }, [products]);

  useEffect(() => {
    if (categoryTabs.length === 0) return;

    const isActiveValid = activeCategorySlug
      ? categoryTabs.some((tab) => tab.slug === activeCategorySlug)
      : false;

    if (!isActiveValid) {
      setActiveCategorySlug(categoryTabs[0].slug);
    }
  }, [categoryTabs, activeCategorySlug]);

  const highlightedProducts = useMemo(() => {
    if (!products?.length || !activeCategorySlug) return [];

    const category = categories.find((item) => item.slug === activeCategorySlug);
    if (!category) return [];

    const inCategory = filterInStockProductsForCategoryLabels(
      products,
      getCategoryProductLabels(category),
    );
    if (inCategory.length < MIN_HOME_FEATURED) return [];

    const featured = resolveHomeFeaturedProducts(inCategory, HOME_HIGHLIGHTED_ROW_SIZE);
    const byId = new Map(inCategory.map((product) => [product.id, product]));

    return featured
      .map((item) => byId.get(item.id))
      .filter((product): product is NonNullable<typeof product> => product != null);
  }, [products, activeCategorySlug]);

  if (!isLoading && categoryTabs.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="lo-mas-destacado-titulo" className="bg-white">
      <div className="container py-8 sm:py-10">
        <h2
          id="lo-mas-destacado-titulo"
          className="mb-4 text-balance text-xl font-bold tracking-tight text-[#0f1f3d] sm:mb-5 sm:text-2xl"
        >
          Lo más destacado
        </h2>

        {!isLoading && categoryTabs.length > 0 ? (
          <div
            className={cn(
              '-mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-6 sm:px-0',
              '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            )}
          >
            <div
              role="tablist"
              aria-label="Categorías de productos destacados"
              className="flex items-center gap-2"
            >
              {categoryTabs.map((tab) => {
                const isActive = activeCategorySlug === tab.slug;

                return (
                  <button
                    key={tab.slug}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategorySlug(tab.slug)}
                    className={cn(
                      'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                      isActive
                        ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                        : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
                    )}
                  >
                    <span className="whitespace-nowrap">{tab.name}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'h-5 min-w-5 shrink-0 px-1.5 text-[0.65rem] leading-none',
                        isActive && 'border-white/25 bg-white/20 text-white',
                      )}
                    >
                      {tab.count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {isError ? (
          <p role="alert" className="text-sm text-destructive">
            No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
          </p>
        ) : isLoading ? (
          <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 xl:overflow-visible xl:pb-0">
            {Array.from({ length: HOME_HIGHLIGHTED_ROW_SIZE }).map((_, index) => (
              <li key={index} className={HIGHLIGHT_ITEM_CLASS}>
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="aspect-square w-full bg-neutral-100" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : highlightedProducts.length >= MIN_HOME_FEATURED ? (
          <ul
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 xl:overflow-visible xl:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
          >
            {highlightedProducts.map((product) => (
              <li key={product.id} className={HIGHLIGHT_ITEM_CLASS}>
                <ProductHighlightCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay productos destacados en esta categoría por ahora.
          </p>
        )}
      </div>
    </section>
  );
}
