import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { buildProductCardSpecBadges } from '@/lib/product-card-spec-badges';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';
import type { ProductAttribute } from '@/types/product';

interface ProductCardSpecBadgesProps {
  product: ProductBadgeSource & { attributes?: ProductAttribute[] };
  className?: string;
}

export function ProductCardSpecBadges({ product, className }: ProductCardSpecBadgesProps) {
  const badges = useMemo(
    () => buildProductCardSpecBadges(product as Parameters<typeof buildProductCardSpecBadges>[0]),
    [product],
  );

  if (badges.length === 0) return null;

  return (
    <ul
      className={cn(
        'flex min-w-0 flex-wrap gap-0.5',
        className,
      )}
      aria-label="Especificaciones del equipo"
    >
      {badges.map((badge) => (
        <li key={badge.id}>
          <Badge
            variant="secondary"
            className="rounded px-1 py-0 text-[0.5625rem] font-medium leading-tight text-muted-foreground sm:text-[0.6rem]"
          >
            {badge.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
