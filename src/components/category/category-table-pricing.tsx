import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { cn } from '@/lib/utils';

interface CategoryTableDiscountBadgeProps {
  productId: string;
  priceUsd: number;
  oldPriceUsd?: number;
  discountPercent?: number;
  className?: string;
}

export function CategoryTableDiscountBadge({
  productId,
  priceUsd,
  oldPriceUsd,
  discountPercent,
  className,
}: CategoryTableDiscountBadgeProps) {
  const pricing = resolveProductCardPricing(productId, priceUsd, {
    ...(oldPriceUsd != null ? { oldPrice: oldPriceUsd } : {}),
    ...(discountPercent != null ? { discount: discountPercent } : {}),
  });

  return (
    <span
      className={cn(
        'inline-flex rounded px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-green-700 bg-green-50',
        className,
      )}
    >
      {pricing.discountPercent}% DCTO
    </span>
  );
}
