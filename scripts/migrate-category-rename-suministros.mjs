import 'dotenv/config';

import { readInventory, writeInventory } from '../server/lib/inventory-store.js';

const CATEGORY_RENAMES = new Map([
  ['Toner', 'Toner Original'],
  ['Toner y suministros', 'Suministros'],
  ['Tóner y Suministros', 'Suministros'],
]);

function remapCategoryValue(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return trimmed;

  if (!trimmed.includes(',')) {
    return CATEGORY_RENAMES.get(trimmed) ?? trimmed;
  }

  const tags = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => CATEGORY_RENAMES.get(part) ?? part);

  return [...new Set(tags)].join(', ');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const inventory = await readInventory();
  let updated = 0;

  const products = inventory.products.map((product) => {
    const nextCategory = remapCategoryValue(product.category);
    if (nextCategory === product.category) return product;
    updated += 1;
    return { ...product, category: nextCategory };
  });

  console.log(`Productos con categoría actualizada: ${updated}`);

  if (dryRun) {
    inventory.products
      .filter((product, index) => products[index].category !== product.category)
      .slice(0, 8)
      .forEach((product, index) => {
        const next = products[inventory.products.indexOf(product)];
        console.log(`• ${product.category} → ${next.category}`);
      });
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  if (updated === 0) {
    console.log('Nada que actualizar en inventario.');
    return;
  }

  const syncProductIds = products
    .filter((product, index) => product.category !== inventory.products[index]?.category)
    .map((product) => product.id);

  await writeInventory(
    {
      products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    },
    { syncProductIds },
  );

  console.log(`Inventario actualizado (${updated} productos).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
