/**
 * Puebla slugs únicos en inventory.json y sincroniza a Supabase.
 * Uso: node scripts/populate-product-slugs.mjs [--dry-run] [--no-sync]
 */
import 'dotenv/config';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { buildSupabaseProductRow } from '../server/lib/product-catalog.js';
import { getInventoryPath } from '../server/lib/server-paths.js';
import { assignUniqueProductSlugs } from '../shared/product-slug.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BATCH = 40;
const dryRun = process.argv.includes('--dry-run');
const skipSync = process.argv.includes('--no-sync');
const forceSync = process.argv.includes('--force-sync');

function loadInventory() {
  const path = getInventoryPath();
  if (!existsSync(path)) {
    console.error(`No se encontró inventario en ${path}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const warehouses = normalizeWarehouses(raw.warehouses);
  const deleted = new Set(
    Array.isArray(raw.deletedProductIds) ? raw.deletedProductIds : [],
  );

  const products = (raw.products ?? [])
    .filter((product) => product?.id && !deleted.has(product.id))
    .map((product) => migrateInventoryProduct(product, warehouses));

  return { path, raw, warehouses, products };
}

function mergeSlugsIntoInventory(raw, warehouses, productsWithSlugs) {
  const byId = new Map(productsWithSlugs.map((product) => [product.id, product]));
  const nextProducts = (raw.products ?? []).map((product) => {
    const migrated = migrateInventoryProduct(product, warehouses);
    const withSlug = byId.get(migrated.id);
    if (!withSlug?.slug) return product;
    return { ...product, slug: withSlug.slug };
  });

  return {
    ...raw,
    products: nextProducts,
  };
}

async function checkSlugColumn(supabase) {
  const { error } = await supabase.from('products').select('slug').limit(1);
  if (!error) return true;

  if (/column|schema cache|Could not find/i.test(error.message)) {
    console.warn('⚠ Falta migración 015 (products.slug).');
    console.warn('  Ejecuta: npm run db:migrate:015');
    console.warn('  o aplica supabase/migrations/015_products_slug.sql en SQL Editor.');
    return false;
  }

  throw new Error(error.message);
}

async function syncSlugsToSupabase(products) {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.warn('Sin SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY; omitiendo sync a Supabase.');
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const hasSlugColumn = await checkSlugColumn(supabase);
  if (!hasSlugColumn) return;

  const rows = products.map((product) => buildSupabaseProductRow(product));

  let done = 0;
  for (let index = 0; index < rows.length; index += BATCH) {
    const chunk = rows.slice(index, index + BATCH);
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) throw new Error(error.message);
    done += chunk.length;
    process.stdout.write(`\r  Supabase slugs: ${done}/${rows.length}`);
  }
  console.log('');
}

async function main() {
  const { path, raw, warehouses, products } = loadInventory();
  const { products: withSlugs, assigned, unchanged, total } = assignUniqueProductSlugs(products);

  console.log(`Catálogo: ${total} productos · ${assigned} slugs nuevos · ${unchanged} ya tenían slug`);

  if (assigned === 0) {
    console.log('Nada que actualizar en inventario.');
  } else if (dryRun) {
    const sample = withSlugs.filter((product) => product.slug).slice(0, 5);
    console.log('Dry-run: primeros slugs asignados:');
    for (const product of sample) {
      console.log(`  ${product.id} → ${product.slug}`);
    }
  } else {
    const nextInventory = mergeSlugsIntoInventory(raw, warehouses, withSlugs);
    writeFileSync(path, `${JSON.stringify(nextInventory, null, 2)}\n`, 'utf8');
    console.log(`✓ Inventario actualizado en ${path}`);
  }

  if (!dryRun && !skipSync && (assigned > 0 || forceSync)) {
    await syncSlugsToSupabase(withSlugs);
    console.log('✓ Slugs sincronizados en Supabase');
  }

  if (!dryRun) {
    console.log('Siguiente paso recomendado: npm run generate:seo-snapshot && npm run generate:sitemap');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
