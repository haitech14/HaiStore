import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

import { FlashDealCard } from '@/components/flash-deals/flash-deal-card';
import { FlashDealsCountdown } from '@/components/flash-deals/flash-deals-countdown';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/use-products';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { resolveFlashDealProducts } from '@/lib/flash-deals';
import { cn } from '@/lib/utils';

const MIN_FLASH_DEALS = 3;

export function FlashDealsSection() {
  const { data: storeProducts } = useProducts();
  const products = useMemo(
    () => resolveFlashDealProducts(storeProducts, 8),
    [storeProducts],
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollState();
    emblaApi.on('select', updateScrollState);
    emblaApi.on('reInit', updateScrollState);
    return () => {
      emblaApi.off('select', updateScrollState);
      emblaApi.off('reInit', updateScrollState);
    };
  }, [emblaApi, updateScrollState, products]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, products]);

  if (products.length < MIN_FLASH_DEALS) {
    return null;
  }

  return (
    <section aria-labelledby="flash-deals-heading" className="w-full">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:flex lg:min-h-[280px]">
        <div className="flex flex-col items-center gap-4 bg-neutral-900 px-6 py-8 text-center lg:w-[min(100%,20rem)] lg:shrink-0 lg:items-start lg:justify-center lg:px-8 lg:text-left xl:w-80">
          <div className="flex items-center gap-2">
            <Zap
              className="size-8 shrink-0 fill-amber-400 text-amber-400 sm:size-9"
              aria-hidden="true"
            />
            <h2
              id="flash-deals-heading"
              className="text-balance text-lg font-extrabold uppercase tracking-wide text-amber-400 sm:text-xl"
            >
              Ofertas relámpago
            </h2>
          </div>

          <p className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">
            ¡Por tiempo limitado!
          </p>

          <FlashDealsCountdown />

          <Link
            to="/tienda"
            className="text-sm font-semibold text-amber-400 underline-offset-4 transition-colors hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          >
            Ver todas las ofertas
          </Link>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col border-t border-border bg-background p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="overflow-hidden" ref={emblaRef}>
            <ul className="flex gap-3 sm:gap-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="min-w-0 shrink-0 flex-[0_0_78%] sm:flex-[0_0_48%] md:flex-[0_0_38%] lg:flex-[0_0_32%] xl:flex-[0_0_28%]"
                >
                  <FlashDealCard product={product} />
                </li>
              ))}
            </ul>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center gap-1 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                'pointer-events-auto size-10 rounded-full border-border bg-card shadow-md',
                !canScrollPrev && 'opacity-40',
              )}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Oferta anterior"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                'pointer-events-auto size-10 rounded-full border-border bg-card shadow-md',
                !canScrollNext && 'opacity-40',
              )}
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Siguiente oferta"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
