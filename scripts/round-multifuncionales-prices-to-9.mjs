import 'dotenv/config';

import fs from 'fs/promises';

import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

function toNearestNineIntegerPart(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;

  const cents = Math.round((num - Math.floor(num)) * 100) / 100;
  const base = Math.floor(num);

  // previous integer ending with 9
  const mod = ((base - 9) % 10 + 10) % 10;
  const down = base - mod;
  const up = down + 10;

  const downDiff = Math.abs(base - down);
  const upDiff = Math.abs(up - base);

  const chosen = upDiff < downDiff ? up : downDiff < upDiff ? down : up; // tie -> up
  return Math.max(0, Math.round((chosen + cents) * 100) / 100);
}

function roundPricesObject(prices) {
  if (!prices || typeof prices !== 'object') return prices;
  const next = { ...prices };
  for (const key of Object.keys(next)) {
    next[key] = toNearestNineIntegerPart(next[key]);
  }
  return next;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { products, deletedProductIds, warehouses } = await readInventory();

  const isMultifuncional = (product) => /multifuncionales/i.test(String(product?.category ?? ''));

  let touched = 0;
  const nextProducts = products.map((p) => ({ ...p }));
  const syncIds = [];

  for (const product of nextProducts) {
    if (!isMultifuncional(product)) continue;

    const beforePublic = product?.prices?.public ?? product.price ?? 0;
    const nextPrices = roundPricesObject(product.prices);
    const afterPublic = nextPrices?.public ?? toNearestNineIntegerPart(beforePublic);

    const changed =
      JSON.stringify(product.prices ?? null) !== JSON.stringify(nextPrices ?? null) ||
      Number(product.price ?? 0) !== Number(afterPublic ?? 0);

    if (!changed) continue;

    product.prices = nextPrices;
    product.price = afterPublic;
    touched += 1;
    syncIds.push(product.id);
  }

  console.log(`\nMultifuncionales ajustados a unidad=9: ${touched}`);
  if (touched > 0) {
    const examples = nextProducts
      .filter((p) => isMultifuncional(p))
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        public: p.prices?.public ?? p.price,
        name: String(p.name ?? '').slice(0, 55),
      }));
    console.log('Ejemplos:', examples);
  }

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  await writeInventory(
    { products: nextProducts, deletedProductIds, warehouses },
    { syncProductIds: syncIds },
  );

  // sanity: ensure file exists (helpful on local)
  await fs.access(getInventoryPath());
  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

