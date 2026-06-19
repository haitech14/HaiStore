import 'dotenv/config';
import fs from 'node:fs/promises';

import {
  appendHaitoneProductSuffix,
  CATEGORY_COMPATIBLE_TONER,
  isCompatibleTonerCategory,
} from '../shared/compatible-toner.js';
import { sanitizeStoredProductMedia } from '../shared/product-media-sanitize.js';
import {
  migrateInventoryProduct,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { shouldPreferSupabaseCatalog } from '../server/lib/catalog-source.js';
import { getInventoryPath } from '../server/lib/server-paths.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { readStoreCategories } from '../server/lib/store-categories-store.js';

function snapshotProduct(product) {
  return JSON.stringify({
    category: product.category,
    name: product.name,
    description: product.description,
    image_url: product.image_url,
    gallery: product.gallery,
  });
}

async function readRawInventoryProducts() {
  let fileProducts = [];
  try {
    const raw = JSON.parse(await fs.readFile(getInventoryPath(), 'utf-8'));
    fileProducts = raw.products ?? [];
  } catch {
    // Sin archivo local.
  }

  if (!shouldPreferSupabaseCatalog()) {
    return fileProducts;
  }

  const { fetchInventoryProductsFromSupabase } = await import('../server/lib/product-catalog.js');
  const supabaseProducts = await fetchInventoryProductsFromSupabase();
  if (supabaseProducts.length === 0) {
    return fileProducts;
  }

  return supabaseProducts;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  await readStoreCategories();

  const rawProducts = await readRawInventoryProducts();
  const inventory = await readInventory();
  const warehouses = inventory.warehouses;
  let updated = 0;
  let mediaCleaned = 0;
  let haitoneRenamed = 0;

  const rawById = new Map(rawProducts.map((product) => [product.id, product]));

  const products = inventory.products.map((product) => {
    const raw = rawById.get(product.id) ?? product;
    const migrated = migrateInventoryProduct(raw, warehouses);

    if (isCompatibleTonerCategory(raw.category) && migrated.name !== raw.name) {
      haitoneRenamed += 1;
      console.log(`• ${product.id}\n  ${raw.name}\n  → ${migrated.name}\n`);
    }

    const hadSyntheticMedia =
      (raw.image_url && raw.image_url !== migrated.image_url) ||
      JSON.stringify(raw.gallery ?? []) !== JSON.stringify(migrated.gallery ?? []);
    if (hadSyntheticMedia) mediaCleaned += 1;

    if (snapshotProduct(raw) !== snapshotProduct(migrated)) {
      updated += 1;
    }

    return migrated;
  });

  console.log(`\nProductos con cambios: ${updated}`);
  console.log(`Tóner compatibles renombrados: ${haitoneRenamed}`);
  console.log(`Medios placeholder eliminados: ${mediaCleaned}`);

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  if (updated === 0) {
    console.log('\nNada que actualizar.');
    return;
  }

  const syncProductIds = products
    .filter((product) => {
      const raw = rawById.get(product.id);
      if (!raw) return true;
      return snapshotProduct(raw) !== snapshotProduct(product);
    })
    .map((product) => product.id);

  await writeInventory(
    {
      products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    },
    { syncProductIds },
  );

  console.log(`\nInventario actualizado (${syncProductIds.length} productos sincronizados).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
