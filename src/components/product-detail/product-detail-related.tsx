import useEmblaCarousel from 'embla-carousel-react';

import {
  CatalogFormatMainHeader,
  CatalogFormatSubHeader,
} from '@/components/category/catalog-format-section-header';
import { ProductHighlightCard } from '@/components/product/product-highlight-card';
import { useProductRelated } from '@/hooks/use-product-related';
import { categoryPath } from '@/lib/category-path';
import { isPrinterEquipment } from '@/lib/build-product-detail';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailRelatedProps {
  product: Product;
  className?: string;
}

const CATEGORY_SLUG = 'multifuncionales';

export function ProductDetailRelated({ product, className }: ProductDetailRelatedProps) {
  const isEquipment = isPrinterEquipment(product);
  const { data: related = [], isLoading } = useProductRelated(product.id, isEquipment);

  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  if (!isEquipment) return null;

  if (isLoading) {
    return (
      <section
        aria-label="Productos relacionados"
        aria-busy="true"
        className={cn('mt-8 border-t border-border/60 pt-8', className)}
      >
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-5 w-56 animate-pulse rounded bg-muted/80" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="productos-relacionados-titulo"
      className={cn('mt-8 border-t border-border/60 pt-8', className)}
    >
      <CatalogFormatMainHeader
        title="Productos relacionados"
        count={related.length}
        className="mb-4 sm:mb-5"
      />
      <span id="productos-relacionados-titulo" className="sr-only">
        Productos relacionados
      </span>

      <CatalogFormatSubHeader
        title="También te podría interesar"
        count={related.length}
        viewAllHref={categoryPath(CATEGORY_SLUG)}
        className="mb-4 sm:mb-5"
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex touch-pan-y gap-3 sm:gap-4">
          {related.map((item) => (
            <li
              key={item.id}
              className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-2rem)/3)] lg:flex-[0_0_calc((100%-4rem)/5)]"
            >
              <ProductHighlightCard product={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
