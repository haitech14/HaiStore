import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import { normalizeInventoryCategoryToLanding, LANDING_CATEGORY } from '../shared/landing-categories.js';
import { normalizeCompatibleTonerCategory } from '../shared/compatible-toner.js';

function normalizeCategory(value) {
  // 1) Normalización general a esquema landing (Suministros, Suministros, Toner Originales, etc.)
  const landing = normalizeInventoryCategoryToLanding(value);
  // 2) Normalización canónica para toner compatible (Suministros, Toner Compatible)
  return normalizeCompatibleTonerCategory(landing);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { products, deletedProductIds, warehouses } = await readInventory();

  let updated = 0;
  const updatedIds = [];

  const nextProducts = products.map((p) => ({ ...p }));

  for (const product of nextProducts) {
    const before = String(product.category ?? '').trim();
    const after = String(normalizeCategory(before)).trim();

    if (!before && !after) continue;
    if (before === after) continue;

    product.category = after || null;
    updated += 1;
    if (product.id) updatedIds.push(product.id);
  }

  console.log(`Productos: ${products.length}`);
  console.log(`Normalizados (categoría): ${updated}`);
  console.log(`Objetivo: "${LANDING_CATEGORY.toner}", "${LANDING_CATEGORY.toner}, ${LANDING_CATEGORY.tonerOriginal}", "${LANDING_CATEGORY.toner}, ${LANDING_CATEGORY.tonerCompatible}"`);

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  await writeInventory(
    { products: nextProducts, deletedProductIds, warehouses },
    { syncProductIds: updatedIds },
  );

  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

