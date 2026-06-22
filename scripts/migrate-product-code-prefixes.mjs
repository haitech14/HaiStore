import 'dotenv/config';

import fs from 'fs/promises';

import { normalizeProductCode } from '../shared/product-code-prefix.js';
import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { getInventoryPath } from '../server/lib/server-paths.js';
import { writeInventory } from '../server/lib/inventory-store.js';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const raw = JSON.parse(await fs.readFile(getInventoryPath(), 'utf-8'));
  const warehouses = normalizeWarehouses(raw.warehouses);
  let updated = 0;

  const products = (raw.products ?? []).map((product) => {
    const current = String(product.code ?? '').trim();
    if (!current) return migrateInventoryProduct(product, warehouses);

    const next = normalizeProductCode(current);
    if (!next || next === current) return migrateInventoryProduct(product, warehouses);

    updated += 1;
    console.log(`• ${product.id}\n  ${current}\n  → ${next}\n`);

    return migrateInventoryProduct({ ...product, code: next }, warehouses);
  });

  console.log(`\nCódigos con prefijo REPUESTO/RICOHLP: ${updated}`);

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  if (updated === 0) {
    console.log('\nNada que actualizar.');
    return;
  }

  const syncProductIds = products
    .filter((product, index) => {
      const before = String(raw.products[index]?.code ?? '').trim();
      const after = String(product.code ?? '').trim();
      return before !== after;
    })
    .map((product) => product.id);

  await writeInventory(
    {
      products,
      deletedProductIds: raw.deletedProductIds ?? [],
      warehouses,
    },
    { syncProductIds },
  );

  console.log(`\nInventario actualizado (${updated} productos).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
