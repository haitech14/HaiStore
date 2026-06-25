import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import { resolveProductCardConditionLabel } from '@/lib/product-card-condition';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

interface ProductCardImageConditionBadgeProps {
  product: ProductBadgeSource & { name: string; category?: string | null };
  className?: string;
}

/** Badge de condición sobre la imagen (esquina superior derecha). */
export function ProductCardImageConditionBadge({
  product,
  className,
}: ProductCardImageConditionBadgeProps) {
  const label = resolveProductCardConditionLabel(product);
  if (!label) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-1.5 top-1.5 z-10 sm:right-2 sm:top-2',
        className,
      )}
      aria-hidden="true"
    >
      <ProductConditionBadge label={label} size="overlay" />
    </div>
  );
}
