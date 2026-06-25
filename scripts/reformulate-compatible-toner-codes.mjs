import 'dotenv/config';

import fs from 'fs/promises';

import {
  buildCompatibleTonerCodeAssignments,
  isCompatibleTonerProduct,
} from '../shared/compatible-toner-product-code.js';
import { CATEGORY_COMPATIBLE_TONER } from '../shared/compatible-toner.js';
import { migrateInventoryProduct, writeInventory } from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const raw = JSON.parse(await fs.readFile(getInventoryPath(), 'utf-8'));
  const warehouses = normalizeWarehouses(raw.warehouses);
  const assignments = buildCompatibleTonerCodeAssignments(raw.products ?? []);
  const changes = [];

  const products = (raw.products ?? []).map((product) => {
    const migrated = migrateInventoryProduct(product, warehouses);
    const assigned = assignments.get(product.id);
    const current = String(migrated.code ?? '').trim();
    const category = isCompatibleTonerProduct(product)
      ? CATEGORY_COMPATIBLE_TONER
      : migrated.category;

    if (!assigned) {
      if (category !== migrated.category) {
        changes.push({
          id: product.id,
          name: product.name,
          before: String(product.code ?? '').trim(),
          after: current,
          categoryOnly: true,
        });
        return { ...migrated, category };
      }
      return migrated;
    }

    const before = String(product.code ?? '').trim();
    if (before === assigned && category === migrated.category) {
      return { ...migrated, category, code: assigned };
    }

    changes.push({
      id: product.id,
      name: product.name,
      before,
      after: assigned,
    });

    return migrateInventoryProduct(
      {
        ...product,
        category,
        code: assigned,
      },
      warehouses,
    );
  });

  const reformulated = changes.filter((row) => !row.categoryOnly);
  console.log(`\nTóner compatibles a reformular: ${reformulated.length}\n`);

  for (const row of reformulated) {
    console.log(`• ${row.id}`);
    console.log(`  ${row.name?.slice(0, 80) ?? '(sin nombre)'}`);
    console.log(`  ${row.before}`);
    console.log(`  → ${row.after}\n`);
  }

  if (dryRun) {
    console.log('(dry-run: no se escribió inventario)');
    return;
  }

  if (reformulated.length === 0) {
    console.log('Nada que actualizar.');
    return;
  }

  const syncProductIds = products
    .filter((product, index) => {
      const before = String(raw.products[index]?.code ?? '').trim();
      const after = String(product.code ?? '').trim();
      const beforeCategory = String(raw.products[index]?.category ?? '').trim();
      const afterCategory = String(product.category ?? '').trim();
      return before !== after || beforeCategory !== afterCategory;
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

  console.log(`Inventario actualizado (${syncProductIds.length} productos).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
