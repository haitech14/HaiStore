import { InventoryDualPrice } from '@/components/admin/inventory/inventory-dual-price';
import { getUsdToPenPurchaseRate } from '@/lib/exchange-rate';

interface CategoryTablePurchaseCellProps {
  purchasePriceUsd: number;
}

export function CategoryTablePurchaseCell({ purchasePriceUsd }: CategoryTablePurchaseCellProps) {
  return (
    <InventoryDualPrice
      usd={purchasePriceUsd}
      exchangeRate={getUsdToPenPurchaseRate()}
    />
  );
}
