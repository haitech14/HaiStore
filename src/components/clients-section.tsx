import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { clients, type Client } from '@/data/clients';
import { cn } from '@/lib/utils';

function ClientLogo({ client }: { client: Client }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      className={cn(
        'flex h-14 w-28 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-white px-2 shadow-sm sm:h-16 sm:w-32 md:h-[4.5rem] md:w-36',
        client.logoSurface === 'dark' && 'bg-neutral-950',
      )}
    >
      {!logoError ? (
        <img
          src={client.logo}
          alt={client.logoAlt}
          className="max-h-full max-w-full object-contain object-center"
          loading="lazy"
          onError={() => setLogoError(true)}
        />
      ) : (
        <span
          className="text-xs font-bold text-muted-foreground"
          aria-hidden="true"
        >
          {client.initials}
        </span>
      )}
    </div>
  );
}

export function ClientsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

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
      aria-labelledby="clientes-titulo"
      className="border-y border-border/40 bg-white py-5 sm:py-6"
    >
      <div className="container">
        <header className="mb-4 text-center sm:mb-5">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
            <h2
              id="clientes-titulo"
              className="text-sm font-bold text-[#0f1f3d] sm:text-base"
            >
              Algunos de nuestros{' '}
              <span className="text-red-600">clientes</span>
            </h2>
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
          </div>
        </header>

        <div className="overflow-hidden" ref={emblaRef}>
          <ul className="flex touch-pan-y gap-5 sm:gap-7">
            {clients.map((client) => (
              <li key={client.id} className="min-w-0 shrink-0">
                <ClientLogo client={client} />
              </li>
            ))}
          </ul>
        </div>

        {scrollSnaps.length > 1 && (
          <div
            className="mt-3 flex items-center justify-center gap-1.5"
            role="tablist"
            aria-label="Paginación de clientes"
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Ir al grupo ${index + 1} de clientes`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                  index === selectedIndex ? 'bg-red-600' : 'bg-neutral-300 hover:bg-neutral-400',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
