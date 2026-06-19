import 'dotenv/config';

import { CATEGORY_COMPATIBLE_TONER } from '../shared/compatible-toner.js';
import {
  buildFourColorTonerPackProduct,
  groupFourColorTonerProducts,
  isBundleProduct,
  syncInventoryBundleProducts,
} from '../server/lib/product-bundle.js';
import { migrateInventoryProduct, readInventory, writeInventory } from '../server/lib/inventory-store.js';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const inventory = await readInventory();
  const warehouses = inventory.warehouses;

  const singles = inventory.products.filter(
    (product) => !isBundleProduct(product) && product.category === CATEGORY_COMPATIBLE_TONER,
  );
  const groups = groupFourColorTonerProducts(singles);
  const existingPacks = new Map(
    inventory.products
      .filter((product) => isBundleProduct(product))
      .map((product) => [String(product.code), product]),
  );

  let created = 0;
  let updated = 0;

  const packProducts = groups.map((group) => {
    const firstCode = String(group.componentProducts[0]?.code ?? '').trim();
    const codeBase = firstCode.replace(/-(CYAN|MAGENTA|YELLOW|NEGRO)$/i, '');
    const code = `${codeBase || 'PACK'}-PACK04`.slice(0, 64);
    const existing = existingPacks.get(code) ?? null;
    const draft = buildFourColorTonerPackProduct({
      baseName: group.baseName,
      components: group.components,
      componentProducts: group.componentProducts,
      category: CATEGORY_COMPATIBLE_TONER,
      existing,
    });

    if (existing) updated += 1;
    else created += 1;

    return migrateInventoryProduct(draft, warehouses);
  });

  const nonPackProducts = inventory.products.filter((product) => !isBundleProduct(product));
  const merged = [...nonPackProducts, ...packProducts];
  const bundleSync = syncInventoryBundleProducts(merged, warehouses);

  console.log(`Grupos CMYK detectados: ${groups.length}`);
  console.log(`Packs nuevos: ${created}`);
  console.log(`Packs actualizados: ${updated}`);

  if (groups.length > 0) {
    const sample = bundleSync.products.find((product) => isBundleProduct(product));
    if (sample) {
      console.log('\nEjemplo:');
      console.log(`• ${sample.name}`);
      console.log(`  Código: ${sample.code}`);
      console.log(`  Precio público USD: ${sample.prices?.public}`);
      console.log(`  Stock pack: ${sample.stock}`);
    }
  }

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  if (groups.length === 0) {
    console.log('\nNo hay packs que generar.');
    return;
  }

  await writeInventory(
    {
      products: bundleSync.products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses,
    },
    { syncProductIds: packProducts.map((product) => product.id) },
  );

  console.log('\nInventario actualizado con packs Pack x04.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
