import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { CategoryCatalogFiltersRow } from '@/components/category/category-catalog-filters-row';
import { CategorySpecFilterTabs } from '@/components/category/category-spec-filter-tabs';
import { CategoryStripPreview } from '@/components/category-strip-preview';
import { SubcategoryTabs } from '@/components/subcategory-tabs';
import { categories, type Category } from '@/data/categories';
import { findCategoryBySlug, resolveCategoryPageProductLabels } from '@/lib/category-product-labels';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { useProducts } from '@/hooks/use-products';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  buildCatalogSpecFilterTabs,
  shouldShowCatalogSpecFilterTabs,
  toggleCatalogSpecFilter,
} from '@/lib/category-catalog-filters';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { isPrinterEquipmentProduct } from '@/lib/product-condition';
import { findStoreCategoryBySlug } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';

const DEFAULT_CATEGORY_SLUG = 'multifuncionales';

const CATEGORY_SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-2rem)/3)] md:flex-[0_0_calc((100%-3rem)/4)] lg:flex-[0_0_calc((100%-5rem)/6)]';

function CategoryImage({ category }: { category: Category }) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(category.image) && !hasError;

  return (
    <div className="flex aspect-[4/3] items-end justify-center bg-muted/30 p-4 sm:p-5">
      {showImage ? (
        <img
          src={category.image}
          alt=""
          className="max-h-[82%] max-w-[88%] object-contain object-bottom drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <category.icon
          className="mb-2 size-14 text-muted-foreground/25 transition-colors group-hover:text-red-600/30 sm:size-16"
          aria-hidden="true"
          strokeWidth={1.25}
        />
      )}
    </div>
  );
}

function CategoryCard({
  category,
  isSelected,
  onSelect,
}: {
  category: Category;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.slug)}
      aria-pressed={isSelected}
      className={cn(
        'group relative z-[1] flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white text-left shadow-[0_8px_24px_-16px_hsl(var(--foreground)/0.45)] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
        isSelected
          ? 'border-red-600 ring-2 ring-red-600/20'
          : 'border-border/70 hover:border-red-600/30 hover:shadow-[0_14px_28px_-16px_hsl(var(--foreground)/0.5)]',
      )}
      aria-label={`Ver subcategorías y productos de ${category.name}`}
    >
      <CategoryImage category={category} />

      <div className="flex min-h-[3.75rem] flex-col items-stretch justify-center gap-2 border-t border-border/60 bg-white px-3 py-2.5 sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
        <p className="text-pretty text-[0.65rem] font-bold uppercase leading-tight tracking-wide text-foreground sm:text-xs">
          {category.name}
        </p>
        <span
          className={cn(
            'inline-flex min-h-8 shrink-0 items-center justify-center self-start rounded-md px-2.5 text-[0.6rem] font-semibold transition-colors sm:self-auto sm:px-3 sm:text-[0.65rem]',
            isSelected
              ? 'bg-red-600 text-white'
              : 'border border-red-600/35 text-red-600 group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white',
          )}
        >
          Ver productos
        </span>
      </div>
    </button>
  );
}

export function CategoryStrip() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(DEFAULT_CATEGORY_SLUG);
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);
  const [selectedSpecFilters, setSelectedSpecFilters] = useState<string[]>([]);
  const { data: products } = useProducts();
  const { data: categoryTreeData } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;

  const storeCategory = useMemo(
    () => (selectedSlug ? findStoreCategoryBySlug(categoryTree, selectedSlug) : undefined),
    [categoryTree, selectedSlug],
  );

  const categoryProductPool = useMemo(() => {
    if (!products?.length || !selectedSlug) return [];

    const category = findCategoryBySlug(selectedSlug);
    if (!category) return [];

    const labels = resolveCategoryPageProductLabels(category, storeCategory, activeSubSlug);

    return products.filter((product) => {
      if (selectedSlug === 'repuestos' && isPrinterEquipmentProduct(product)) {
        return false;
      }
      return labels.some((label) => productMatchesCategoryFilter(product, label));
    });
  }, [products, selectedSlug, storeCategory, activeSubSlug]);

  const specTabs = useMemo(() => {
    if (!selectedSlug || !shouldShowCatalogSpecFilterTabs(selectedSlug)) return [];
    return buildCatalogSpecFilterTabs(categoryProductPool);
  }, [selectedSlug, categoryProductPool]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleSelectCategory = useCallback((slug: string) => {
    setSelectedSlug((current) => {
      const next = current === slug ? null : slug;
      if (next !== current) {
        setActiveSubSlug(null);
        setSelectedSpecFilters([]);
      }
      return next;
    });
  }, []);

  const handleSelectSub = useCallback((subSlug: string | null) => {
    setActiveSubSlug((current) => (current === subSlug ? null : subSlug));
    setSelectedSpecFilters([]);
  }, []);

  const toggleSpecFilter = useCallback((key: string) => {
    setSelectedSpecFilters((prev) => toggleCatalogSpecFilter(prev, key));
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;

    const frame = window.requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedSlug, activeSubSlug]);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  const arrowClass = cn(
    'absolute top-[42%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md',
    'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-30',
    'hidden sm:flex',
  );

  return (
    <section aria-labelledby="categorias-titulo" className="bg-background">
      <div className="container py-10 sm:py-12">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
            <h2
              id="categorias-titulo"
              className="text-balance text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl"
            >
              <span className="text-red-600">Explora</span>{' '}
              <span className="text-foreground">nuestras categorías</span>
            </h2>
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
          </div>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            Elige una categoría para ver productos aquí mismo.
          </p>
        </header>

        <div className="relative sm:px-1">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(arrowClass, '-left-1 lg:-left-3')}
            aria-label="Categorías anteriores"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div ref={emblaRef} className="overflow-hidden">
            <ul className="flex gap-3 sm:gap-4" role="list" aria-label="Categorías de productos">
              {categories.map((category) => (
                <li key={category.slug} className={CATEGORY_SLIDE_CLASS}>
                  <CategoryCard
                    category={category}
                    isSelected={selectedSlug === category.slug}
                    onSelect={handleSelectCategory}
                  />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(arrowClass, '-right-1 lg:-right-3')}
            aria-label="Categorías siguientes"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        {selectedSlug ? (
          <div ref={previewRef} aria-live="polite">
            <CategoryCatalogFiltersRow
              className="mt-8"
              subcategories={
                storeCategory && storeCategory.children.length > 0 ? (
                  <SubcategoryTabs
                    heading="Subcategorías"
                    align="start"
                    parentName={storeCategory.name}
                    subcategories={storeCategory.children}
                    activeSubSlug={activeSubSlug}
                    onSelect={handleSelectSub}
                  />
                ) : null
              }
              filters={
                specTabs.length > 0 ? (
                  <CategorySpecFilterTabs
                    tabs={specTabs}
                    selectedKeys={selectedSpecFilters}
                    onToggle={toggleSpecFilter}
                    heading="Filtros"
                    ariaLabel="Filtros de formato y color"
                    groupLabel="Formato y color"
                    align="end"
                  />
                ) : null
              }
            />

            <CategoryStripPreview
              key={`${selectedSlug}-${activeSubSlug ?? 'all'}-${selectedSpecFilters.join(',')}`}
              categorySlug={selectedSlug}
              activeSubSlug={activeSubSlug}
              selectedSpecFilters={selectedSpecFilters}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
