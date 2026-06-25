import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import { normalizeInventoryCategoryToLanding, LANDING_CATEGORY } from '../shared/landing-categories.js';

const DEFAULT_BUMP_USD = 3;

function parseNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function bumpPrice(value, bumpUsd) {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return Math.max(0, Math.round((num + bumpUsd) * 100) / 100);
}

function productIsExcluded(product) {
  const normalizedCategory = normalizeInventoryCategoryToLanding(product.category ?? '').toLowerCase();
  if (!normalizedCategory) return false;

  // Excluir Multifuncionales y todas sus subcategorías.
  if (normalizedCategory.includes(LANDING_CATEGORY.multifuncionales.toLowerCase())) {
    return true;
  }

  // Excluir tóner original y compatible (independiente del nodo padre).
  if (normalizedCategory.includes(LANDING_CATEGORY.tonerOriginal.toLowerCase())) return true;
  if (normalizedCategory.includes(LANDING_CATEGORY.tonerCompatible.toLowerCase())) return true;

  return false;
}

async function main() {
  const args = new Map();
  for (const raw of process.argv.slice(2)) {
    const [key, val] = raw.split('=');
    if (key && val != null) args.set(key.replace(/^--/, ''), val);
  }

  const bumpUsd = parseNumber(args.get('bumpUsd'), DEFAULT_BUMP_USD);
  const dryRun = process.argv.includes('--dry-run');

  const { products, deletedProductIds, warehouses } = await readInventory();

  let updated = 0;
  let excluded = 0;

  const nextProducts = products.map((p) => ({ ...p }));
  const updatedIds = [];

  for (const product of nextProducts) {
    if (!product?.id) continue;
    if (productIsExcluded(product)) {
      excluded += 1;
      continue;
    }

    const prices = typeof product.prices === 'object' && product.prices ? { ...product.prices } : null;
    const beforePublic = prices?.public ?? product.price ?? 0;
    const afterPublic = bumpPrice(beforePublic, bumpUsd);

    if (prices) {
      prices.public = afterPublic;
      product.prices = prices;
    } else {
      product.prices = { public: afterPublic };
    }
    product.price = afterPublic;

    updated += 1;
    updatedIds.push(product.id);
  }

  console.log(`Productos en inventario: ${products.length}`);
  console.log(`Excluidos (Multifuncionales / Toner Original / Toner Compatible): ${excluded}`);
  console.log(`Actualizados (+$${bumpUsd} a precio público): ${updated}`);

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  await writeInventory(
    {
      products: nextProducts,
      deletedProductIds,
      warehouses,
    },
    { syncProductIds: updatedIds },
  );

  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

