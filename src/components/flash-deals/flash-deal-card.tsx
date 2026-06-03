import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { FeaturedProduct } from '@/data/featured-products';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsd, usdToPen } from '@/lib/utils';

interface FlashDealCardProps {
  product: FeaturedProduct;
}

function formatPenStrike(usd: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdToPen(usd));
}

export function FlashDealCard({ product }: FlashDealCardProps) {
  const [imageError, setImageError] = useState(false);
  const brandLabel = product.brand?.trim().toUpperCase();
  const detailHref = productPath(product.id);

  return (
    <article className="flex h-full min-h-[17rem] flex-col rounded-lg border border-border bg-card p-3 sm:min-h-[18rem] sm:p-4">
      <Link
        to={detailHref}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      >
        <div className="relative mb-3 flex aspect-[4/3] items-center justify-center rounded-md bg-muted/40 p-3">
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-3xl font-bold text-muted-foreground/40" aria-hidden="true">
              {product.name.charAt(0)}
            </span>
          )}
        </div>

        {brandLabel ? (
          <p className="truncate text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
            {brandLabel}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 text-pretty text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>

        <div className="mt-auto space-y-0.5 pt-3">
          {product.oldPrice != null ? (
            <p className="text-sm text-muted-foreground line-through">{formatPenStrike(product.oldPrice)}</p>
          ) : null}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-lg font-bold text-foreground sm:text-xl">{formatPenFromUsd(product.price)}</p>
            {product.discount != null ? (
              <span className={cn('text-sm font-bold text-green-600')}>{product.discount}% DSCTO</span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
