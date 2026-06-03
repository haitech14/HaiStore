import { readInventory, writeInventory } from './inventory-store.js';
import { shouldPreferSupabaseCatalog } from './catalog-source.js';
import { syncProductsToSupabase } from './product-catalog.js';

/** Aplica un producto recibido desde HaiSupport al inventario HaiStore. */
export async function syncProductFromHaiSupport(product) {
  if (!product?.id) {
    throw new Error('Producto HaiSupport sin id');
  }

  const inventory = await readInventory();
  const index = inventory.products.findIndex((entry) => entry.id === product.id);

  if (index >= 0) {
    inventory.products[index] = { ...inventory.products[index], ...product };
  } else {
    inventory.products.push(product);
  }

  await writeInventory({
    products: inventory.products,
    warehouses: inventory.warehouses,
    deletedProductIds: inventory.deletedProductIds ?? [],
  });

  if (shouldPreferSupabaseCatalog()) {
    await syncProductsToSupabase(inventory.products);
  }
}

export async function deleteProductFromHaiSupport(productId) {
  if (!productId) return;

  const inventory = await readInventory();
  const deleted = new Set(inventory.deletedProductIds ?? []);
  deleted.add(productId);

  const products = inventory.products.filter((entry) => entry.id !== productId);
  await writeInventory({
    products,
    warehouses: inventory.warehouses,
    deletedProductIds: [...deleted],
  });

  if (shouldPreferSupabaseCatalog()) {
    await syncProductsToSupabase(products);
  }
}
