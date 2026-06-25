import 'dotenv/config';

import fs from 'fs/promises';

import { migrateInventoryProduct, writeInventory } from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

const REPUESTOS_ORIGINALES_CATEGORY = 'Repuestos, Repuestos Originales';
const PRICE_BUMP_USD = 9;

const ALLOWED_CATEGORY_PATTERNS = [
  /\btoner\s+original\b/i,
  /\btoner\s+compatible\b/i,
  /\bmultifuncionales\s+nuevas\b/i,
  /\bmultifuncionales\s+seminuevas\b/i,
  /\bimpresoras\b/i,
];

function isAllowedCategory(category) {
  const value = String(category ?? '').trim();
  if (!value) return false;
  return ALLOWED_CATEGORY_PATTERNS.some((pattern) => pattern.test(value));
}

function bumpPrices(prices, bumpUsd) {
  if (!prices || typeof prices !== 'object') return prices;
  const next = { ...prices };
  for (const key of Object.keys(next)) {
    const value = Number(next[key]);
    if (!Number.isFinite(value)) continue;
    next[key] = Math.max(0, Math.round((value + bumpUsd) * 100) / 100);
  }
  return next;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const raw = JSON.parse(await fs.readFile(getInventoryPath(), 'utf-8'));
  const warehouses = normalizeWarehouses(raw.warehouses);

  let deleted = 0;
  let moved = 0;
  let bumped = 0;
  const changes = [];
  const deletedIds = new Set();

  const nextProducts = [];
  for (const product of raw.products ?? []) {
    const id = String(product?.id ?? '').trim();
    const name = String(product?.name ?? '');
    const beforeCategory = String(product?.category ?? '');

    // Eliminar el placeholder que aparece como tarjeta vacía ($0.00, CODIGO/DESCRIPCION…).
    if (id === 'codigo') {
      deleted += 1;
      deletedIds.add(id);
      changes.push({ id, name, before: beforeCategory, after: '(eliminado)', bump: 0 });
      continue;
    }

    if (isAllowedCategory(beforeCategory)) {
      nextProducts.push(migrateInventoryProduct(product, warehouses));
      continue;
    }

    const next = {
      ...product,
      category: REPUESTOS_ORIGINALES_CATEGORY,
      prices: bumpPrices(product.prices, PRICE_BUMP_USD),
    };
    if (typeof product.price === 'number' && Number.isFinite(product.price)) {
      next.price = Math.max(0, Math.round((product.price + PRICE_BUMP_USD) * 100) / 100);
    }

    const after = migrateInventoryProduct(next, warehouses);
    moved += beforeCategory === after.category ? 0 : 1;
    bumped += 1;
    changes.push({
      id,
      name,
      before: beforeCategory,
      after: after.category,
      bump: PRICE_BUMP_USD,
    });
    nextProducts.push(after);
  }

  console.log(`\nEliminados: ${deleted}`);
  console.log(`Movidos a "${REPUESTOS_ORIGINALES_CATEGORY}": ${moved}`);
  console.log(`Precios incrementados (+$${PRICE_BUMP_USD}): ${bumped}\n`);

  for (const row of changes.slice(0, 120)) {
    console.log(`• ${row.id}`);
    console.log(`  ${String(row.name ?? '').slice(0, 100)}`);
    console.log(`  ${row.before}`);
    console.log(`  → ${row.after}${row.bump ? ` ( +$${row.bump} )` : ''}\n`);
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
      deletedProductIds: [...new Set([...(raw.deletedProductIds ?? []), ...deletedIds])],
      warehouses,
    },
    { syncProductIds: [...new Set(syncProductIds)] },
  );

  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

