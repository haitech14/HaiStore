/**
 * Sincroniza inventario local → Supabase y comprueba el esquema.
 * Uso: node scripts/sync-supabase.mjs
 *
 * Requiere en .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Migraciones SQL (si faltan columnas): ejecutar en Supabase → SQL Editor
 *   supabase/migrations/001 … 005 en orden.
 */
import 'dotenv/config';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import { persistProductsMedia } from '../server/lib/persist-product-media.js';
import { buildSupabaseProductRow } from '../server/lib/product-catalog.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BATCH = 40;

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

function loadLocalInventory() {
  const path = getInventoryPath();
  if (!existsSync(path)) {
    console.error(`No se encontró inventario en ${path}`);
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const warehouses = normalizeWarehouses(data.warehouses);
  const deleted = new Set(
    Array.isArray(data.deletedProductIds) ? data.deletedProductIds : [],
  );
  const products = (data.products ?? [])
    .filter((p) => p?.id && !deleted.has(p.id))
    .map((p) => migrateInventoryProduct(p, warehouses));
  return { products, warehouses };
}

async function checkCatalogSchema() {
  const schema = { has005: false, has006: false };

  const r005 = await supabase.from('products').select('gallery,sort_order,inventory_snapshot').limit(1);
  if (!r005.error) {
    schema.has005 = true;
    console.log('✓ Esquema de catálogo (migración 005) presente');
  } else if (/column|schema cache|Could not find/i.test(r005.error.message)) {
    console.warn('⚠ Falta migración 005 (gallery, sort_order, inventory_snapshot).');
    console.warn('  En Supabase → SQL Editor, ejecuta:');
    console.warn('  supabase/migrations/005_products_catalog_fields.sql');
  } else {
    console.error('Error al comprobar migración 005:', r005.error.message);
  }

  const r006 = await supabase.from('products').select('is_featured,view_count').limit(1);
  if (!r006.error) {
    schema.has006 = true;
    console.log('✓ Esquema de catálogo (migración 006) presente');
  } else if (/column|schema cache|Could not find/i.test(r006.error.message)) {
    console.warn('⚠ Falta migración 006 (is_featured, view_count).');
    console.warn('  En Supabase → SQL Editor, ejecuta:');
    console.warn('  supabase/migrations/006_products_featured_views.sql');
  } else {
    console.error('Error al comprobar migración 006:', r006.error.message);
  }

  return schema;
}

function projectRowForSchema(row, schema) {
  let payload = { ...row };
  if (!schema.has005) {
    const {
      gallery: _g,
      sort_order: _s,
      attributes: _a,
      inventory_snapshot: _i,
      updated_at: _u,
      ...legacy
    } = payload;
    payload = legacy;
  }
  if (!schema.has006) {
    const { is_featured: _f, view_count: _v, ...rest } = payload;
    payload = rest;
  }
  return payload;
}

async function upsertBatch(rows, schema) {
  const payload = rows.map((row) => projectRowForSchema(row, schema));
  const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

async function syncProducts(products, schema) {
  const withMedia = await persistProductsMedia(products);
  const rows = withMedia.map((p) => buildSupabaseProductRow(p));
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await upsertBatch(chunk, schema);
    done += chunk.length;
    process.stdout.write(`\r  Productos: ${done}/${rows.length}`);
  }
  console.log('');
}

async function syncCategoriesFromProducts() {
  const migrationsDir = resolve(root, 'supabase/migrations');
  const fixSql = resolve(migrationsDir, '004_fix_category_slug_upsert.sql');
  if (!existsSync(fixSql)) return;

  console.log('✓ Tras la carga, ejecuta 004 en SQL Editor si las categorías no aparecen en pedidos.');
}

async function countRemote() {
  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function tryApplyMigration005() {
  const token =
    process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!token) return false;

  const { spawnSync } = await import('child_process');
  const result = spawnSync(
    'node',
    ['scripts/apply-supabase-migration.mjs', 'supabase/migrations/005_products_catalog_fields.sql'],
    { cwd: root, encoding: 'utf8', stdio: 'pipe' },
  );
  if (result.status === 0) {
    console.log(result.stdout.trim());
    return true;
  }
  console.warn(result.stderr?.trim() || result.stdout?.trim());
  return false;
}

async function main() {
  console.log('HaiStore — sincronización local → Supabase\n');

  let schema = await checkCatalogSchema();
  if (!schema.has005) {
    console.log('Intentando aplicar migración 005…');
    if (await tryApplyMigration005()) {
      schema = await checkCatalogSchema();
    }
  }
  const { products } = loadLocalInventory();
  console.log(`Inventario local: ${products.length} productos`);

  const before = await countRemote();
  console.log(`Supabase antes: ${before} productos\n`);

  await syncProducts(products, schema);

  const after = await countRemote();
  console.log(`Supabase después: ${after} productos`);

  await syncCategoriesFromProducts();

  const migrationFiles = readdirSync(resolve(root, 'supabase/migrations'))
    .filter((f) => f.endsWith('.sql'))
    .sort();
  console.log('\nMigraciones (aplicar en SQL Editor si el proyecto es nuevo):');
  for (const file of migrationFiles) {
    console.log(`  - supabase/migrations/${file}`);
  }

  console.log('\nSiguiente: npm run sync:product-images && vercel deploy --prod');
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
