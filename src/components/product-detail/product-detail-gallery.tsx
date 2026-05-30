import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play, Search, Truck } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ProductGalleryItem } from '@/types/product-detail';

interface ProductDetailGalleryProps {
  items: ProductGalleryItem[];
  productName: string;
}

function getItemThumb(item: ProductGalleryItem): string {
  if (item.type === 'image') return item.src;
  return item.poster ?? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
}

function getItemLabel(item: ProductGalleryItem, index: number, productName: string): string {
  if (item.type === 'video') {
    return `Ver video ${index + 1} de ${productName}`;
  }
  return `Ver imagen ${index + 1} de ${productName}`;
}

export function ProductDetailGallery({ items, productName }: ProductDetailGalleryProps) {
  const galleryItems = items.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const activeItem = galleryItems[activeIndex] ?? galleryItems[0];
  const showThumbnails = galleryItems.length > 1;
  const canScrollPrev = activeIndex > 0;
  const canScrollNext = activeIndex < galleryItems.length - 1;
  const activeIsVideo = activeItem?.type === 'video';

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveIndex((i) => Math.min(galleryItems.length - 1, i + 1));

  return (
    <div
      className={cn(
        'flex w-full gap-2',
        showThumbnails ? 'flex-col sm:flex-row sm:items-stretch' : 'flex-col',
      )}
    >
      {showThumbnails && (
        <div className="order-2 flex items-center justify-center gap-1.5 sm:order-1 sm:w-[4.75rem] sm:shrink-0 sm:flex-col sm:justify-start">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canScrollPrev}
            aria-label="Elemento anterior"
            className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex"
          >
            <ChevronUp className="size-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={goPrev}
            disabled={!canScrollPrev}
            aria-label="Elemento anterior"
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:hidden"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </button>

          <ul className="flex flex-row justify-center gap-1.5 sm:flex-col">
            {galleryItems.map((item, index) => {
              const isVideo = item.type === 'video';
              const thumbSrc = getItemThumb(item);

              return (
                <li key={`${item.type}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={getItemLabel(item, index, productName)}
                    aria-current={activeIndex === index ? 'true' : undefined}
                    className={cn(
                      'relative flex size-14 items-center justify-center overflow-hidden rounded-md bg-white p-1 transition-colors sm:size-[4.25rem]',
                      activeIndex === index
                        ? 'border-2 border-red-600'
                        : 'border border-neutral-200 hover:border-red-400',
                    )}
                  >
                    {!imageError[index] ? (
                      <img
                        src={thumbSrc}
                        alt=""
                        className="size-full object-contain object-center"
                        loading="lazy"
                        onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                      />
                    ) : (
                      <span className="text-xs text-neutral-300">{index + 1}</span>
                    )}
                    {isVideo && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-black/25"
                      >
                        <span className="flex size-6 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm">
                          <Play className="ml-0.5 size-3 fill-current" aria-hidden="true" />
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={goNext}
            disabled={!canScrollNext}
            aria-label="Siguiente elemento"
            className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex"
          >
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canScrollNext}
            aria-label="Siguiente elemento"
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:hidden"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="relative order-1 min-w-0 flex-1 overflow-hidden rounded-xl bg-white sm:order-2">
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            <Truck className="size-3.5" aria-hidden="true" />
            Envío rápido
          </span>
        </div>

        {!activeIsVideo && (
          <button
            type="button"
            aria-label="Ampliar imagen del producto"
            className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <Search className="size-3" aria-hidden="true" />
          </button>
        )}

        <div
          className={cn(
            'flex items-center justify-center bg-white',
            activeIsVideo
              ? 'aspect-[4/3] p-0 sm:aspect-video'
              : 'min-h-[280px] p-1.5 sm:min-h-[380px] lg:min-h-[460px] xl:min-h-[520px]',
          )}
        >
          {activeItem?.type === 'video' ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeItem.youtubeId}?rel=0`}
              title={activeItem.title ?? `Video de ${productName}`}
              className="size-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : !imageError[activeIndex] && activeItem?.type === 'image' ? (
            <img
              src={activeItem.src}
              alt={activeItem.alt ?? productName}
              className="max-h-[min(68vh,640px)] w-full max-w-full object-contain object-center"
              loading="eager"
              onError={() => setImageError((prev) => ({ ...prev, [activeIndex]: true }))}
            />
          ) : (
            <span className="text-5xl font-bold text-neutral-200" aria-hidden="true">
              {productName.charAt(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
