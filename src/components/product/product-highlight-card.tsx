import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';

import { AddToCartButton, getAddToCartLabel, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

const HIGHLIGHT_TEXT = '#0f1f3d';

export function ProductHighlightCard({ product }: { product: Product }) {
  const { displayCurrency } = useDisplayCurrency();
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product.id);
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = imageFailed ? null : resolveProductImageUrl(product, { stockFallback: false });
  const buyLabel = outOfStock ? getAddToCartLabel(product) : 'Comprar';

  const priceLabel =
    displayCurrency === 'USD' ? formatUsd(product.price) : formatPenFromUsd(product.price);

  return (
    <article className="flex h-full flex-col bg-white">
      <Link
        to={detailHref}
        className="relative flex aspect-square w-full items-center justify-center bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1b3d] focus-visible:ring-offset-2"
        aria-label={`Ver ficha de ${product.name}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="max-h-[90%] max-w-[90%] object-contain object-center"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImageOff className="size-10 text-muted-foreground/40" aria-hidden="true" />
        )}
      </Link>

      <div className="flex flex-1 flex-col items-center gap-2 px-0.5 pt-3 text-center">
        <Link
          to={detailHref}
          className="w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1b3d] focus-visible:ring-offset-2"
        >
          <h3
            className="line-clamp-3 text-balance text-[0.6875rem] font-normal uppercase leading-snug sm:text-xs"
            style={{ color: HIGHLIGHT_TEXT }}
          >
            {product.name}
          </h3>
        </Link>

        <p
          className="text-sm font-bold tabular-nums sm:text-[0.9375rem]"
          style={{ color: HIGHLIGHT_TEXT }}
        >
          {priceLabel}
        </p>

        <AddToCartButton
          product={product}
          addOptions={{ quantity: 1 }}
          className={cn(
            'mt-auto h-10 w-full rounded-sm text-sm font-semibold focus-visible:ring-[#0d1b3d]',
            outOfStock
              ? 'border border-[#0d1b3d]/25 bg-white text-[#0f1f3d] hover:bg-neutral-50'
              : 'bg-[#0d1b3e] text-white hover:bg-[#0a1628]',
          )}
        >
          {buyLabel}
        </AddToCartButton>
      </div>
    </article>
  );
}
