import 'dotenv/config';

import fs from 'fs/promises';

import {
  isCompoundNumericInventoryCode,
  resolveSimplifiedInventoryProductCode,
} from '../shared/product-code-suffix.js';
import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { getInventoryPath } from '../server/lib/server-paths.js';
import { writeInventory } from '../server/lib/inventory-store.js';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const raw = JSON.parse(await fs.readFile(getInventoryPath(), 'utf-8'));
  const warehouses = normalizeWarehouses(raw.warehouses);
  let updated = 0;
  const changes = [];

  const products = (raw.products ?? []).map((product) => {
    const current = String(product.code ?? '').trim();
    if (!current || !isCompoundNumericInventoryCode(current)) {
      return migrateInventoryProduct(product, warehouses);
    }

    const next = resolveSimplifiedInventoryProductCode(current, {
      category: product.category ?? null,
      name: product.name ?? null,
    });

    if (!next || next === current) {
      return migrateInventoryProduct(product, warehouses);
    }

    updated += 1;
    changes.push({
      id: product.id,
      name: product.name,
      before: current,
      after: next,
    });

    return migrateInventoryProduct({ ...product, code: next }, warehouses);
  });

  console.log(`\nCódigos compuestos analizados: ${changes.length} actualizaciones\n`);

  for (const row of changes) {
    console.log(`• ${row.id}`);
    console.log(`  ${row.name?.slice(0, 72) ?? '(sin nombre)'}`);
    console.log(`  ${row.before}`);
    console.log(`  → ${row.after}\n`);
  }

  if (dryRun) {
    console.log('(dry-run: no se escribió inventario)');
    return;
  }

  if (updated === 0) {
    console.log('Nada que actualizar.');
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

  console.log(`Inventario actualizado (${updated} productos).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
