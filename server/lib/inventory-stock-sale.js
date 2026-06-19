import {
  deductProductStock,
  expandSaleLinesForStock,
  isBundleProduct,
  syncInventoryBundleProducts,
} from './product-bundle.js';
import { readInventory, writeInventory } from './inventory-store.js';

/**
 * Descuenta stock de componentes cuando se vende un pack (o productos sueltos).
 * @param {{ productId?: string | null; quantity?: number }[]} lineItems
 */
export async function applySaleStockDeduction(lineItems) {
  if (!Array.isArray(lineItems) || lineItems.length === 0) return { updated: 0 };

  const inventory = await readInventory();
  const warehouses = inventory.warehouses;
  const byId = new Map(inventory.products.map((product) => [String(product.id), product]));
  const deductions = expandSaleLinesForStock(lineItems, byId);

  if (deductions.size === 0) return { updated: 0 };

  const changedIds = new Set();
  let products = inventory.products.map((product) => {
    const qty = deductions.get(String(product.id));
    if (!qty) return product;
    changedIds.add(String(product.id));
    return deductProductStock(product, qty, warehouses);
  });

  const bundleSync = syncInventoryBundleProducts(products, warehouses);
  products = bundleSync.products;
  if (bundleSync.changed) {
    for (const product of products) {
      if (isBundleProduct(product)) changedIds.add(String(product.id));
    }
  }

  if (changedIds.size === 0) return { updated: 0 };

  await writeInventory(
    {
      products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses,
    },
    { syncProductIds: [...changedIds] },
  );

  return { updated: changedIds.size };
}
