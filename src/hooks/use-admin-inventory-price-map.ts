import { useMemo } from 'react';

import { useAuth } from '@/context/auth-context';
import { useAdminInventory } from '@/hooks/use-products';
import { ensureFullPrices, type ProductRolePrices } from '@/lib/roles';

export function useAdminInventoryPriceMap(): Map<string, ProductRolePrices> | null {
  const { isAdmin } = useAuth();
  const { data: inventory } = useAdminInventory();

  return useMemo(() => {
    if (!isAdmin || !inventory?.length) return null;
    return new Map(
      inventory.map((product) => [product.id, ensureFullPrices(product.prices)]),
    );
  }, [isAdmin, inventory]);
}

export function useAdminProductRolePrices(productId: string): ProductRolePrices | null {
  const map = useAdminInventoryPriceMap();
  return map?.get(productId) ?? null;
}
