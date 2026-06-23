import { useMemo } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import { useAuth } from '@/context/auth-context';
import type { CatalogRolePriceLine } from '@/hooks/use-catalog-display-price';
import { resolveCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { PRICE_ROLE_LABELS, type PriceRole, type ProductRolePrices } from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailRolePriceLinesProps {
  product: Pick<Product, 'id' | 'price' | 'prices' | 'price_role'>;
  quantity: number;
  fullPrices: ProductRolePrices;
  bulkDiscountTiers: BulkDiscountTier[];
  equipmentExtrasUsd: number;
  className?: string;
}

function computeRoleTotalUsd(
  role: PriceRole,
  quantity: number,
  fullPrices: ProductRolePrices,
  bulkDiscountTiers: BulkDiscountTier[],
  equipmentExtrasUsd: number,
): number {
  const baseUsd = fullPrices[role];
  const volume = resolveBulkDiscountPricing(quantity, baseUsd, bulkDiscountTiers, {
    floorPriceUsd: fullPrices.tecnico,
  });
  return volume.totalUsd + equipmentExtrasUsd * quantity;
}

/** Precio total en ficha: desglose por rol para admin o vista previa. */
export function ProductDetailRolePriceLines({
  product,
  quantity,
  fullPrices,
  bulkDiscountTiers,
  equipmentExtrasUsd,
  className,
}: ProductDetailRolePriceLinesProps) {
  const { isAdmin, viewAsRoles, effectiveRole } = useAuth();

  const publicTotalUsd = useMemo(
    () =>
      computeRoleTotalUsd('public', quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd),
    [quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd],
  );

  const tecnicoTotalUsd = useMemo(
    () =>
      computeRoleTotalUsd('tecnico', quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd),
    [quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd],
  );

  const displayPrice = resolveCatalogDisplayPrice(product, {
    viewAsRoles,
    effectiveRole,
    isAdmin,
  });

  const visitorTotalUsd = useMemo(() => {
    const baseUsd = displayPrice.previewAsRole ? displayPrice.priceUsd : product.price;
    const volume = resolveBulkDiscountPricing(quantity, baseUsd, bulkDiscountTiers, {
      floorPriceUsd: fullPrices.tecnico,
    });
    return volume.totalUsd + equipmentExtrasUsd * quantity;
  }, [
    displayPrice.previewAsRole,
    displayPrice.priceUsd,
    product.price,
    quantity,
    bulkDiscountTiers,
    fullPrices.tecnico,
    equipmentExtrasUsd,
  ]);

  const viewAsTotals = useMemo<CatalogRolePriceLine[]>(() => {
    if (displayPrice.viewAsRolePrices.length <= 1) return [];
    return displayPrice.viewAsRolePrices.map((line) => ({
      ...line,
      priceUsd: computeRoleTotalUsd(
        line.priceRole,
        quantity,
        fullPrices,
        bulkDiscountTiers,
        equipmentExtrasUsd,
      ),
    }));
  }, [
    displayPrice.viewAsRolePrices,
    quantity,
    fullPrices,
    bulkDiscountTiers,
    equipmentExtrasUsd,
  ]);

  if (viewAsTotals.length > 1) {
    return (
      <ViewAsRolePrices
        rolePrices={viewAsTotals}
        alwaysBoth
        className={cn('text-sm sm:text-base', className)}
      />
    );
  }

  const showAdminBreakdown = isAdmin && viewAsRoles.length === 0;

  if (showAdminBreakdown) {
    return (
      <ul className={cn('space-y-1', className)} aria-label="Precios por rol">
        <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {PRICE_ROLE_LABELS.tecnico}
          </span>
          <DualPrice
            usd={tecnicoTotalUsd}
            alwaysBoth
            className="text-xl font-bold leading-tight text-red-600 sm:text-2xl"
          />
        </li>
        <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {PRICE_ROLE_LABELS.public}
          </span>
          <DualPrice
            usd={publicTotalUsd}
            alwaysBoth
            className="text-xl font-bold leading-tight text-red-600 sm:text-2xl"
          />
        </li>
      </ul>
    );
  }

  return (
    <DualPrice
      usd={visitorTotalUsd}
      alwaysBoth
      className="text-2xl font-bold leading-tight text-red-600 sm:text-[1.75rem]"
    />
  );
}

interface TonerCardRolePricesProps {
  prices: ProductRolePrices;
  className?: string;
}

/** Precio de tóner en selector hero: dual y desglose Técnico/Público para admin. */
export function TonerCardRolePrices({ prices, className }: TonerCardRolePricesProps) {
  const { isAdmin, viewAsRoles } = useAuth();
  const showAdminBreakdown = isAdmin && viewAsRoles.length === 0;

  if (showAdminBreakdown) {
    return (
      <span className={cn('mt-0.5 block space-y-0.5', className)}>
        <span className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
          <span className="font-semibold text-muted-foreground">{PRICE_ROLE_LABELS.tecnico}:</span>
          <DualPrice usd={prices.tecnico} className="font-bold text-red-600" />
        </span>
        <span className="flex flex-wrap items-baseline gap-x-1.5 text-xs sm:text-sm">
          <span className="font-semibold text-muted-foreground">{PRICE_ROLE_LABELS.public}:</span>
          <DualPrice usd={prices.public} className="font-bold text-red-600" />
        </span>
      </span>
    );
  }

  return (
    <span className={cn('mt-0.5 block text-xs font-bold text-red-600 sm:text-sm', className)}>
      <DualPrice usd={prices.public} />
    </span>
  );
}
