import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { useProducts } from '@/hooks/use-products';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailRelatedProps {
  product: Product;
  className?: string;
}

function RelatedCard({ item }: { item: Product }) {
  const image = buildProductImageCandidates(item)[0] ?? '/categories/multifuncionales.png';
  const subtitle =
    item.description?.slice(0, 72) ??
    'Equipo multifuncional profesional para oficinas exigentes.';

  return (
    <article className="flex h-full gap-3 rounded-xl border border-border/60 bg-white p-3 shadow-sm">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30 sm:size-24">
        <img
          src={image}
          alt=""
          className="max-h-full max-w-full object-contain p-1"
          loading="lazy"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 text-sm font-bold text-[#0f1f3d]">{item.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
        <Link
          to={productPath(item.id)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Ver producto
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function ProductDetailRelated({ product, className }: ProductDetailRelatedProps) {
  const { data: products = [] } = useProducts();

  const related = useMemo(() => {
    const category = product.category?.toLowerCase() ?? '';
    return products
      .filter((row) => row.id !== product.id)
      .filter((row) => {
        if (!category) return true;
        return (row.category ?? '').toLowerCase().includes('multifuncional') ||
          (row.category ?? '').toLowerCase().includes('impresora') ||
          category.split(' ').some((part) => (row.category ?? '').toLowerCase().includes(part));
      })
      .slice(0, 8);
  }, [product.category, product.id, products]);

  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="productos-relacionados-titulo"
      className={cn('mt-8 border-t border-border/60 pt-8', className)}
    >
      <h2
        id="productos-relacionados-titulo"
        className="mb-4 text-lg font-bold text-[#0f1f3d] sm:mb-5 sm:text-xl"
      >
        Productos relacionados
      </h2>

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex touch-pan-y gap-4">
          {related.map((item) => (
            <li
              key={item.id}
              className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] xl:flex-[0_0_24%]"
            >
              <RelatedCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
