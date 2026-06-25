import 'dotenv/config';

import fs from 'fs/promises';

import { migrateInventoryProduct, writeInventory } from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

const TONER_COMPATIBLE_CATEGORY = 'Toner, Toner Compatible';
const REPUESTOS_ORIGINALES_CATEGORY = 'Repuestos, Repuestos Originales';

function isTonerCartuchoCompatible(product) {
  return /\btoner\s+cartucho\s+compatible\b/i.test(String(product?.name ?? ''));
}

function isUnidadDeImagenOrPcdu(product) {
  const name = String(product?.name ?? '');
  return /\bunidad\s+de\s+imagen\b/i.test(name) || /\bPCDU\b/i.test(name);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const raw = JSON.parse(await fs.readFile(getInventoryPath(), 'utf-8'));
  const warehouses = normalizeWarehouses(raw.warehouses);

  let updated = 0;
  let deleted = 0;
  const changes = [];

  const nextProducts = [];
  for (const product of raw.products ?? []) {
    const migrated = migrateInventoryProduct(product, warehouses);
    const beforeCategory = String(product.category ?? '');
    const beforeId = String(product.id ?? '');

    // Mover "Toner cartucho compatible" → Toner Compatible (sin el tag Suministros).
    if (isTonerCartuchoCompatible(product)) {
      const next = { ...product, category: TONER_COMPATIBLE_CATEGORY };
      const after = migrateInventoryProduct(next, warehouses);
      if (beforeCategory !== after.category) {
        updated += 1;
        changes.push({ id: beforeId, before: beforeCategory, after: after.category, name: product.name });
      }
      nextProducts.push(after);
      continue;
    }

    // Mover Unidad de imagen / PCDU → Repuestos Originales.
    if (isUnidadDeImagenOrPcdu(product)) {
      const next = { ...product, category: REPUESTOS_ORIGINALES_CATEGORY };
      const after = migrateInventoryProduct(next, warehouses);
      if (beforeCategory !== after.category) {
        updated += 1;
        changes.push({ id: beforeId, before: beforeCategory, after: after.category, name: product.name });
      }
      nextProducts.push(after);
      continue;
    }

    // Eliminar el resto del contenido que quedó colgado bajo "Suministros".
    const cat = String(product.category ?? '');
    if (/suministros/i.test(cat)) {
      deleted += 1;
      changes.push({ id: beforeId, before: beforeCategory, after: '(eliminado)', name: product.name });
      continue;
    }

    nextProducts.push(migrated);
  }

  console.log(`\nActualizaciones de categoría: ${updated}`);
  console.log(`Eliminados por "Suministros": ${deleted}\n`);

  for (const row of changes.slice(0, 120)) {
    console.log(`• ${row.id}`);
    console.log(`  ${String(row.name ?? '').slice(0, 90)}`);
    console.log(`  ${row.before}`);
    console.log(`  → ${row.after}\n`);
  }
  if (changes.length > 120) {
    console.log(`(… ${changes.length - 120} cambios más)`);
  }

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  const syncProductIds = (raw.products ?? [])
    .filter((p) => nextProducts.some((np) => np.id === p.id) === false)
    .map((p) => p.id);

  await writeInventory(
    {
      products: nextProducts,
      deletedProductIds: raw.deletedProductIds ?? [],
      warehouses,
    },
    { syncProductIds: [...new Set(syncProductIds)] },
  );

  console.log(`Inventario actualizado: ${updated} movidos, ${deleted} eliminados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

