import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { CategoryStripPreview } from '@/components/category-strip-preview';
import { categories, type Category } from '@/data/categories';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const CATEGORY_SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-2rem)/3)] md:flex-[0_0_calc((100%-3rem)/4)] lg:flex-[0_0_calc((100%-5rem)/6)]';

function CategoryImage({ category }: { category: Category }) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(category.image) && !hasError;

  return (
    <div className="flex aspect-[16/10] items-center justify-center bg-white p-3 sm:p-4">
      {showImage ? (
        <img
          src={category.image}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <category.icon
          className="size-16 text-muted-foreground/20 transition-colors group-hover:text-red-600/25"
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

      <div className="flex min-h-14 items-center justify-between gap-2 border-t border-border/60 bg-white px-3 py-3 sm:px-4">
        <p className="text-pretty text-[0.65rem] font-bold uppercase leading-tight tracking-wide text-foreground sm:text-xs">
          {category.name}
        </p>
        <span
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-full border bg-white sm:size-7',
            isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-red-600/40',
          )}
          aria-hidden="true"
        >
          <ChevronRight
            className={cn(
              'size-4 transition-transform group-hover:translate-x-0.5',
              isSelected ? 'text-white' : 'text-red-600',
            )}
            aria-hidden="true"
          />
        </span>
      </div>
    </button>
  );
}

export function CategoryStrip() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);

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
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;

    const frame = window.requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedSlug]);

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
            Elige una categoría para ver subcategorías y productos aquí mismo.
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
            <CategoryStripPreview
              key={selectedSlug}
              categorySlug={selectedSlug}
              activeSubSlug={activeSubSlug}
              onSelectSub={setActiveSubSlug}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
