import 'dotenv/config';

import {
  moveParentheticalSuffixToEnd,
} from '../shared/inventory-product-name.js';
import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import { readStoreCategories } from '../server/lib/store-categories-store.js';

const TARGET_CATEGORY = 'Repuestos Originales';

/** Etiquetas del árbol «Suministros» (cat-toner y subcategorías). */
function collectSuministrosTreeLabels(categories) {
  const labels = new Set();
  for (const row of categories) {
    if (row.id === 'cat-toner' || row.parentId === 'cat-toner') {
      for (const label of row.inventoryLabels ?? []) {
        labels.add(label);
      }
    }
  }
  return labels;
}

/** Conserva tóner/cartuchos/ tinta bajo Suministros. */
function isTonerSupplyProduct(name, category) {
  const normalizedName = String(name ?? '').toLowerCase();
  const normalizedCategory = String(category ?? '').toLowerCase();

  if (normalizedCategory.includes('toner compatible')) return true;
  if (/toner|cartucho|cartridge|print cart|ink cart|pro ar ink|600 ml|pro print cartridge|recarga/i.test(normalizedName)) {
    return true;
  }

  return false;
}

function shouldMoveToRepuestosOriginales(product, suministrosLabels) {
  const category = String(product.category ?? '').trim();
  if (!category || !suministrosLabels.has(category)) return false;
  if (/toner/i.test(category) && isTonerSupplyProduct(product.name, category)) return false;
  return true;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const categories = await readStoreCategories();
  const suministrosLabels = collectSuministrosTreeLabels(categories);
  const inventory = await readInventory();

  let categoryUpdates = 0;
  let nameUpdates = 0;

  const products = inventory.products.map((product) => {
    let next = product;

    const nextName = moveParentheticalSuffixToEnd(product.name);
    if (nextName !== product.name) {
      nameUpdates += 1;
      next = { ...next, name: nextName };
    }

    if (shouldMoveToRepuestosOriginales(next, suministrosLabels)) {
      if (next.category !== TARGET_CATEGORY) {
        categoryUpdates += 1;
        next = { ...next, category: TARGET_CATEGORY };
      }
    }

    return next;
  });

  console.log(`Títulos con paréntesis al final: ${nameUpdates}`);
  console.log(`Categoría → ${TARGET_CATEGORY}: ${categoryUpdates}`);

  if (dryRun) {
    products
      .filter((product, index) => product !== inventory.products[index])
      .slice(0, 6)
      .forEach((product) => {
        const before = inventory.products.find((row) => row.id === product.id);
        console.log(`\n• ${before?.name}`);
        if (before?.name !== product.name) console.log(`  nombre → ${product.name}`);
        if (before?.category !== product.category) {
          console.log(`  ${before?.category} → ${product.category}`);
        }
      });
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  if (categoryUpdates === 0 && nameUpdates === 0) {
    console.log('Nada que actualizar.');
    return;
  }

  const syncProductIds = products
    .filter((product, index) => {
      const before = inventory.products[index];
      return before && (before.name !== product.name || before.category !== product.category);
    })
    .map((product) => product.id);

  await writeInventory(
    {
      products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    },
    { syncProductIds },
  );

  console.log(`\nInventario actualizado (${syncProductIds.length} productos sincronizados).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
