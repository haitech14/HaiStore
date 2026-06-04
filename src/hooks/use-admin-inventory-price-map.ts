import { useMemo } from 'react';

import { useAuth } from '@/context/auth-context';
import { useAdminInventory } from '@/hooks/use-products';
import { ensureFullPrices, type ProductRolePrices } from '@/lib/roles';
import type { InventoryProduct } from '@/types/product';

export interface AdminCatalogInventoryEntry {
  prices: ProductRolePrices;
  purchasePriceUsd: number;
  product: InventoryProduct;
}

export function useAdminInventoryCatalogMap(): Map<string, AdminCatalogInventoryEntry> | null {
  const { isAdmin } = useAuth();
  const { data: inventory, dataUpdatedAt } = useAdminInventory();

  return useMemo(() => {
    if (!isAdmin || !inventory?.length) return null;
    return new Map(
      inventory.map((product) => [
        product.id,
        {
          prices: ensureFullPrices(product.prices),
          purchasePriceUsd: Number(product.purchase_price_usd) || 0,
          product,
        },
      ]),
    );
  }, [isAdmin, dataUpdatedAt, inventory]);
}

export function useAdminInventoryPriceMap(): Map<string, ProductRolePrices> | null {
  const catalogMap = useAdminInventoryCatalogMap();

  return useMemo(() => {
    if (!catalogMap) return null;
    return new Map(
      [...catalogMap.entries()].map(([id, entry]) => [id, entry.prices]),
    );
  }, [catalogMap]);
}

export function useAdminProductRolePrices(productId: string): ProductRolePrices | null {
  const map = useAdminInventoryPriceMap();
  return map?.get(productId) ?? null;
}
