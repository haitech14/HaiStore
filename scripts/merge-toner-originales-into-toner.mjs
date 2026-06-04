import 'dotenv/config';

import {
  ensureProductSortOrders,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { mergeTonerOriginalesIntoToner } from '../server/lib/merge-toner-categories.js';

async function main() {
  const inventory = await readInventory();
  const beforeOriginales = inventory.products.filter((p) => p.category === 'Toner originales').length;
  const beforeToner = inventory.products.filter((p) => p.category === 'Toner').length;

  const { products: mergedProducts, stats } = mergeTonerOriginalesIntoToner(inventory.products);
  const { products } = ensureProductSortOrders(mergedProducts);

  const afterOriginales = products.filter((p) => p.category === 'Toner originales').length;
  const afterToner = products.filter((p) => p.category === 'Toner').length;

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log('Fusión Toner originales → Toner');
  console.log(`  Antes: ${beforeOriginales} originales, ${beforeToner} toner (${inventory.products.length} total)`);
  console.log(`  Después: ${afterOriginales} originales, ${afterToner} toner (${products.length} total)`);
  console.log(`  Grupos por código: ${stats.tonerGroups}`);
  console.log(`  Códigos fusionados (duplicado): ${stats.fusedByCode}`);
  console.log(`  Filas originales absorbidas: ${stats.movedFromOriginales}`);
  console.log(`  Productos eliminados por fusión: ${stats.removedDuplicates}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
