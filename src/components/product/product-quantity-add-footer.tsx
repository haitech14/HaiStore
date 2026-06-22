import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

import {
  AddToCartButton,
  getAddToCartLabel,
  isProductOutOfStock,
} from '@/components/cart/add-to-cart-button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductQuantityAddFooterProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md';
  onQuantityChange?: (quantity: number) => void;
}

export function ProductQuantityAddFooter({
  product,
  className,
  size = 'md',
  onQuantityChange,
}: ProductQuantityAddFooterProps) {
  const outOfStock = isProductOutOfStock(product);
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = outOfStock ? 1 : Math.max(1, product.stock);
  const cartLabel = outOfStock ? getAddToCartLabel(product, 'short') : 'Añadir';

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => {
      const next = Math.max(1, Math.min(maxQuantity, current + delta));
      onQuantityChange?.(next);
      return next;
    });
  };

  const qtyButtonClass =
    size === 'sm'
      ? 'flex size-7 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40 sm:size-8'
      : 'flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40';

  const qtyValueClass =
    size === 'sm'
      ? 'min-w-[0.875rem] text-center text-[0.6875rem] font-semibold tabular-nums text-foreground sm:text-xs'
      : 'min-w-[1rem] text-center text-xs font-semibold tabular-nums text-foreground';

  const addButtonClass =
    size === 'sm'
      ? 'h-7 min-h-7 min-w-0 flex-1 gap-1 rounded-md px-1.5 text-[0.625rem] font-semibold sm:h-8 sm:min-h-8 sm:px-2 sm:text-xs'
      : 'h-8 min-h-8 min-w-0 flex-1 gap-1.5 rounded-md px-2 text-xs font-semibold sm:h-9 sm:min-h-9 sm:text-sm';

  return (
    <div
      className={cn('flex w-full shrink-0 items-stretch gap-1.5 sm:gap-2', className)}
    >
      <div
        className="flex shrink-0 items-center rounded-md border border-border bg-white"
        role="group"
        aria-label={`Cantidad de ${product.name}`}
      >
        <button
          type="button"
          onClick={() => adjustQuantity(-1)}
          disabled={outOfStock || quantity <= 1}
          aria-label="Disminuir cantidad"
          className={qtyButtonClass}
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </button>
        <span className={qtyValueClass} aria-live="polite" aria-atomic="true">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => adjustQuantity(1)}
          disabled={outOfStock || quantity >= maxQuantity}
          aria-label="Aumentar cantidad"
          className={qtyButtonClass}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <AddToCartButton
        product={product}
        addOptions={{ quantity }}
        className={cn(
          addButtonClass,
          outOfStock
            ? 'border border-border bg-white text-foreground hover:bg-muted/30'
            : 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
        )}
      >
        {!outOfStock ? <ShoppingCart className="size-4 shrink-0" aria-hidden="true" /> : null}
        {cartLabel}
      </AddToCartButton>
    </div>
  );
}
