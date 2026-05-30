import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  Laptop,
  LayoutGrid,
  ShoppingCart,
  Smartphone,
  Star,
  Watch,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { featuredProducts, type FeaturedProduct } from '@/data/featured-products';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

type CategoryFilterId = 'all' | 'audio' | 'laptops' | 'smartphones' | 'smartwatches';

const CATEGORY_FILTERS: {
  id: CategoryFilterId;
  label: string;
  icon: typeof LayoutGrid;
  categories: string[] | null;
}[] = [
  { id: 'all', label: 'Todos', icon: LayoutGrid, categories: null },
  { id: 'audio', label: 'Audio', icon: Headphones, categories: ['Audio'] },
  { id: 'laptops', label: 'Laptops', icon: Laptop, categories: ['Laptops'] },
  { id: 'smartphones', label: 'Smartphones', icon: Smartphone, categories: ['Smartphones'] },
  { id: 'smartwatches', label: 'Smartwatches', icon: Watch, categories: ['Smartwatches'] },
];

function filterFeaturedProducts(filterId: CategoryFilterId): FeaturedProduct[] {
  const filter = CATEGORY_FILTERS.find((item) => item.id === filterId);
  if (!filter?.categories) return featuredProducts;
  return featuredProducts.filter((product) => filter.categories!.includes(product.category));
}

function DualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span>{formatUsd(usd)}</span>
      <span aria-hidden="true" className="font-normal text-muted-foreground">
        ·
      </span>
      <span>{formatPenFromUsd(usd)}</span>
    </span>
  );
}

function Rating({ rating, reviews }: { rating: number; reviews: number }) {
  const fullStars = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Valoración ${rating} de 5, ${reviews} reseñas`}
    >
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              index < fullStars ? 'fill-red-600 text-red-600' : 'fill-neutral-200 text-neutral-200',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-400">({reviews})</span>
    </div>
  );
}

function FeaturedCard({ product }: { product: FeaturedProduct }) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      description: null,
      price: product.price,
      currency: 'USD',
      image_url: product.image,
      stock: 10,
      category: product.category,
      created_at: new Date().toISOString(),
    });
  };

  const detailHref = productPath(product.id);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
      <div className="relative">
        <Link
          to={detailHref}
          className="relative block bg-neutral-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset"
        >
          <div className="flex aspect-[4/3] items-center justify-center p-5 sm:aspect-square sm:p-6">
            {!imageError ? (
              <img
                src={product.image}
                alt=""
                className="max-h-full max-w-full object-contain"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-4xl font-bold text-neutral-200" aria-hidden="true">
                {product.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="sr-only">Ver ficha de {product.name}</span>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3">
          {product.discount != null ? (
            <span className="inline-flex rounded-md bg-red-600 px-2 py-0.5 text-[0.7rem] font-bold text-white">
              -{product.discount}%
            </span>
          ) : product.isNew ? (
            <span className="inline-flex rounded-md bg-neutral-900 px-2 py-0.5 text-[0.7rem] font-bold text-white">
              Nuevo
            </span>
          ) : null}
        </div>

        <button
          type="button"
          aria-label={`Añadir ${product.name} a favoritos`}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-red-600 shadow-sm transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <Heart className="size-4 fill-none" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-1">
        <Link
          to={detailHref}
          className="flex flex-1 flex-col gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-neutral-400">
            {product.category}
          </p>
          <h3 className="text-sm font-bold leading-snug text-neutral-900 sm:text-[0.95rem]">
            {product.name}
          </h3>
          <Rating rating={product.rating} reviews={product.reviews} />

          <div className="mt-1 space-y-0.5">
            <p className="text-base font-bold text-neutral-900">
              <DualPrice usd={product.price} />
            </p>
            {product.oldPrice != null && (
              <p className="text-sm font-normal text-neutral-400 line-through decoration-neutral-400">
                <DualPrice usd={product.oldPrice} />
              </p>
            )}
          </div>
        </Link>

        <Button
          type="button"
          onClick={handleAdd}
          className="mt-auto h-10 w-full gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          Añadir al carrito
        </Button>
      </div>
    </article>
  );
}

export function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilterId>('all');
  const filteredProducts = useMemo(() => filterFeaturedProducts(activeFilter), [activeFilter]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
  }, [emblaApi, filteredProducts]);

  return (
    <section aria-labelledby="productos-destacados-titulo">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2
            id="productos-destacados-titulo"
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.75rem]"
          >
            Productos destacados
          </h2>
          <p className="mt-2 text-sm text-neutral-500 sm:text-[0.95rem]">
            Descubre nuestros productos más populares con ofertas exclusivas
          </p>
        </div>
        <Link
          to="/tienda"
          className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:pt-1"
        >
          Ver todos los productos
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filtrar productos por categoría"
      >
        {CATEGORY_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                isActive
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
              )}
            >
              <Icon
                className={cn('size-4', isActive ? 'text-white' : 'text-neutral-400')}
                aria-hidden="true"
              />
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Productos anteriores"
          className="absolute -left-1 top-[42%] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:-left-5"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="overflow-hidden sm:mx-12 lg:mx-14" ref={emblaRef}>
          {filteredProducts.length > 0 ? (
            <ul className="flex touch-pan-y gap-4">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_46%] md:flex-[0_0_31%] lg:flex-[0_0_calc((100%-4rem)/5)]"
                >
                  <FeaturedCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-12 text-center text-sm text-neutral-500" role="status">
              No hay productos en esta categoría por ahora.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={scrollNext}
          aria-label="Más productos"
          className="absolute -right-1 top-[42%] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:-right-5"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
