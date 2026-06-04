import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  RENTAL_PARENT_SLUG,
  rentalCategories,
  type RentalCategory,
} from '@/data/rental-categories';
import { categoryPath } from '@/lib/category-path';
import { cn } from '@/lib/utils';

/** Ancho de slide en el contenedor flex de Embla (debe ir en el `<li>`). */
export const RENTAL_CAROUSEL_SLIDE_CLASS =
  'min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc((100%-1rem)/2)] lg:flex-[0_0_calc((100%-3rem)/4)]';

export function RentalCategoryCard({ item }: { item: RentalCategory }) {
  const Icon = item.icon;

  return (
    <article
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_8px_28px_-18px_hsl(var(--foreground)/0.35)]',
      )}
    >
      <div className={cn('relative aspect-[4/3] overflow-hidden', item.imageBgClass)}>
        <img
          src={item.image}
          alt=""
          className="size-full object-cover object-center"
          loading="lazy"
        />
        <span
          className="absolute bottom-0 left-1/2 z-10 flex size-14 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background shadow-md"
          aria-hidden="true"
        >
          <Icon className="size-7 text-primary" strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-5 pt-10 text-center">
        <Link
          to={categoryPath(RENTAL_PARENT_SLUG, item.slug)}
          className={cn(
            'mx-auto inline-flex min-h-11 w-full max-w-[16rem] items-center justify-center rounded-lg px-4 py-2.5',
            'bg-gradient-to-r from-sky-600 to-indigo-700 text-sm font-bold text-white shadow-sm',
            'transition-opacity hover:opacity-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          {item.title}
        </Link>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        <Link
          to={`/contacto?servicio=${encodeURIComponent(item.title)}`}
          className="mt-4 text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Solicitar cotización
        </Link>
      </div>
    </article>
  );
}

interface RentalCategoriesCarouselProps {
  className?: string;
  /** Muestra flechas desde móvil (por defecto solo sm+). */
  showArrowsOnMobile?: boolean;
}

export function RentalCategoriesCarousel({
  className,
  showArrowsOnMobile = false,
}: RentalCategoriesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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
    'absolute top-[38%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-30',
    showArrowsOnMobile ? 'flex' : 'hidden sm:flex',
  );

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={cn(arrowClass, '-left-1')}
        aria-label="Anterior"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      <div ref={emblaRef} className="overflow-hidden px-0.5">
        <ul className="flex gap-4" role="list" aria-label="Tipos de alquiler">
          {rentalCategories.map((item) => (
            <li key={item.slug} className={RENTAL_CAROUSEL_SLIDE_CLASS}>
              <RentalCategoryCard item={item} />
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={cn(arrowClass, '-right-1')}
        aria-label="Siguiente"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
