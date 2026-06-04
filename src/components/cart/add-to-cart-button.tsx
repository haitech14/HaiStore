import { useState, type MouseEvent } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { AddToCartOptions } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

export function isProductOutOfStock(product: Product): boolean {
  return product.stock <= 0;
}

export function getAddToCartLabel(
  product: Product,
  variant: 'default' | 'short' | 'detail' = 'default',
): string {
  if (isProductOutOfStock(product)) {
    return variant === 'short' ? 'A pedido' : 'Comprar a Pedido';
  }
  if (variant === 'short') return 'Añadir';
  if (variant === 'detail') return 'Agregar al carrito';
  return 'Añadir al carrito';
}

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: Product;
  addOptions?: AddToCartOptions;
}

export function AddToCartButton({
  product,
  addOptions,
  className,
  disabled,
  children,
  ...props
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = isProductOutOfStock(product);
  const defaultLabel = getAddToCartLabel(product);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;

    addItem(product, addOptions);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <Button
      type="button"
      disabled={disabled}
      aria-live="polite"
      aria-label={
        justAdded
          ? `${product.name} agregado al carrito`
          : outOfStock
            ? `Comprar ${product.name} a pedido`
            : `Añadir ${product.name} al carrito`
      }
      onClick={handleClick}
      className={cn(
        'gap-2 transition-all duration-300 motion-reduce:transition-none',
        justAdded && 'cart-add-success bg-emerald-600 hover:bg-emerald-600',
        className,
      )}
      {...props}
    >
      {justAdded ? (
        <>
          <Check className="size-4 motion-safe:animate-in motion-safe:zoom-in" aria-hidden="true" />
          <span className="motion-safe:animate-in motion-safe:fade-in">¡Agregado!</span>
        </>
      ) : (
        children ?? (
          <>
            <ShoppingCart className="size-4" aria-hidden="true" />
            {defaultLabel}
          </>
        )
      )}
    </Button>
  );
}
