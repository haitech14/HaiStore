import 'dotenv/config';

import {
  ensureProductSortOrders,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  mergeKnownEquipmentTonerProducts,
  wireEquipmentTonerCrossSell,
} from '../server/lib/known-equipment-toners.js';

async function main() {
  const inventory = await readInventory();
  const tonerMerge = mergeKnownEquipmentTonerProducts(inventory.products);
  const wired = wireEquipmentTonerCrossSell(tonerMerge.products);
  const { products } = ensureProductSortOrders(wired.products);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(
    `Tóneres de equipo: ${tonerMerge.created} nuevos, ${tonerMerge.updated} actualizados; ${wired.wired} equipos con venta cruzada.`,
  );
  console.log(`Total en inventario: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
