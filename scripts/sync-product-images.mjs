/**
 * Exporta imágenes data: → public/products/*.webp y actualiza Supabase.
 * Uso: npm run sync:product-images
 *
 * Requiere .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (usa HAISTORE_CATALOG_SOURCE=supabase durante la ejecución)
 */
import 'dotenv/config';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { persistProductsMedia, publicProductMediaPath, getPublicProductsDir } from '../server/lib/persist-product-media.js';
import { buildSupabaseProductRow } from '../server/lib/product-catalog.js';
import { syncProductsToSupabase } from '../server/lib/product-catalog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

process.env.HAISTORE_CATALOG_SOURCE = 'supabase';

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

function productFromRow(row) {
  const snapshot = row.inventory_snapshot;
  if (snapshot && typeof snapshot === 'object' && snapshot.id) {
    return migrateInventoryProduct(snapshot);
  }
  return migrateInventoryProduct({
    id: row.id,
    name: row.name,
    description: row.description,
    prices: row.prices ?? { public: row.price ?? 0 },
    currency: row.currency ?? 'USD',
    image_url: row.image_url,
    gallery: Array.isArray(row.gallery) ? row.gallery : row.image_url ? [row.image_url] : [],
    stock: row.stock ?? 0,
    category: row.category,
    brand: row.brand,
    created_at: row.created_at,
    sort_order: row.sort_order ?? 0,
    attributes: Array.isArray(row.attributes) ? row.attributes : [],
  });
}

function attachExistingPublicFile(product) {
  const publicPath = publicProductMediaPath(product.id);
  const absolute = resolve(getPublicProductsDir(), `${publicPath.split('/').pop()}`);
  if (!existsSync(absolute)) return product;

  const gallery = Array.isArray(product.gallery) ? [...product.gallery] : [];
  if (!gallery.includes(publicPath)) {
    gallery.unshift(publicPath);
  }
  return {
    ...product,
    image_url: publicPath,
    gallery: gallery.length > 0 ? gallery : [publicPath],
  };
}

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function main() {
  console.log('HaiStore — sincronización de imágenes de producto\n');

  const rows = await fetchProducts();
  console.log(`Productos en Supabase: ${rows.length}`);

  const raw = rows.map(productFromRow);
  const withDisk = raw.map(attachExistingPublicFile);

  const dataBefore = withDisk.filter((p) => String(p.image_url ?? '').startsWith('data:')).length;
  console.log(`Con imagen data: URL antes de exportar: ${dataBefore}`);

  const persisted = await persistProductsMedia(withDisk);
  const withPublic = persisted.filter((p) =>
    String(p.image_url ?? '').startsWith('/products/'),
  ).length;

  await syncProductsToSupabase(persisted);

  const stillData = persisted.filter((p) => String(p.image_url ?? '').startsWith('data:')).length;

  console.log(`\n✓ ${withPublic} productos con ruta /products/*.webp`);
  if (stillData > 0) {
    console.warn(`⚠ ${stillData} productos siguen con data: URL (sube imagen en admin)`);
  }

  console.log('\nSiguiente paso (incluye public/products en el deploy):');
  console.log('  npm run build && vercel deploy --prod');
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
