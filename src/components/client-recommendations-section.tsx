import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  clientRecommendations,
  type ClientRecommendation,
} from '@/data/client-recommendations';
import { cn } from '@/lib/utils';

const SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.5rem)/2)] sm:flex-[0_0_calc((100%-1.25rem)/3)] md:flex-[0_0_calc((100%-2.25rem)/4)] lg:flex-[0_0_calc((100%-3rem)/5)] xl:flex-[0_0_calc((100%-3.75rem)/6)]';

function RecommendationSlide({
  item,
  onOpen,
}: {
  item: ClientRecommendation;
  onOpen: (item: ClientRecommendation) => void;
}) {
  return (
    <li className={SLIDE_CLASS}>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={cn(
          'group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-left shadow-[0_2px_16px_rgba(15,23,42,0.06)]',
          'transition-shadow hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
        )}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={item.image}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/0 transition-colors',
              'group-hover:bg-black/25 group-focus-visible:bg-black/25',
            )}
            aria-hidden="true"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <ZoomIn className="size-5" strokeWidth={2} />
            </span>
          </span>
        </div>
        <p className="px-3 py-2.5 text-center text-[0.7rem] font-semibold leading-snug text-foreground sm:text-xs">
          {item.caption}
        </p>
        <span className="sr-only">Ver imagen ampliada: {item.imageAlt}</span>
      </button>
    </li>
  );
}

export function ClientRecommendationsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<ClientRecommendation | null>(null);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateSnaps();
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', updateSnaps);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', updateSnaps);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section
      aria-labelledby="clientes-recomiendan-titulo"
      className="relative overflow-hidden border-t border-border/60 bg-muted/30 py-12 sm:py-16"
    >
      <div className="container relative">
        <header className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 bg-sky-400 sm:w-12" aria-hidden="true" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-500 sm:text-xs">
              Testimonios reales
            </p>
            <span className="h-px w-8 bg-sky-400 sm:w-12" aria-hidden="true" />
          </div>

          <h2
            id="clientes-recomiendan-titulo"
            className="mt-4 text-balance text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-3xl lg:text-[2rem]"
          >
            Nuestros clientes nos recomiendan
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Experiencias de compra, entrega y soporte. Toca una foto para verla en grande.
          </p>
        </header>

        <div className="relative">
          {canScrollPrev ? (
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute -left-1 top-[38%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:-left-3"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          ) : null}
          {canScrollNext ? (
            <button
              type="button"
              onClick={scrollNext}
              className="absolute -right-1 top-[38%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:-right-3"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          ) : null}

          <div className="overflow-hidden px-0.5" ref={emblaRef}>
            <ul className="flex touch-pan-y gap-2 sm:gap-2.5 md:gap-3">
              {clientRecommendations.map((item) => (
                <RecommendationSlide key={item.id} item={item} onOpen={setLightboxItem} />
              ))}
            </ul>
          </div>
        </div>

        {scrollSnaps.length > 1 ? (
          <div
            className="mt-4 flex items-center justify-center gap-1.5"
            role="tablist"
            aria-label="Paginación de testimonios"
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Ir al grupo ${index + 1} de fotos`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                  index === selectedIndex ? 'bg-red-600' : 'bg-neutral-300 hover:bg-neutral-400',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      <Dialog open={lightboxItem != null} onOpenChange={(open) => !open && setLightboxItem(null)}>
        <DialogContent
          className="max-w-[min(56rem,calc(100vw-2rem))] gap-3 border-none bg-neutral-950/95 p-3 sm:p-4"
          overlayClassName="bg-black/80"
        >
          {lightboxItem ? (
            <>
              <DialogTitle className="text-center text-sm font-semibold text-white sm:text-base">
                {lightboxItem.caption}
              </DialogTitle>
              <DialogDescription className="sr-only">{lightboxItem.imageAlt}</DialogDescription>
              <div className="flex max-h-[min(85dvh,52rem)] items-center justify-center overflow-hidden rounded-lg bg-black/40">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.imageAlt}
                  className="max-h-[min(85dvh,52rem)] w-full object-contain"
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
