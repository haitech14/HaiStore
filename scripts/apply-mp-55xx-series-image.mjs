/**
 * Aplica la foto de catálogo Ricoh MP 55xx (misma serie: 2555/3055/3555/6055)
 * a los productos seminuevos correspondientes.
 *
 * Uso: node scripts/apply-mp-55xx-series-image.mjs
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import {
  getPublicProductsDir,
  publicProductMediaPath,
} from '../server/lib/persist-product-media.js';
import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { buildSupabaseProductRow, syncProductsToSupabase } from '../server/lib/product-catalog.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_IMAGE = path.join(root, 'data/seeds/ricoh-mp-55xx-series.png');
const CANONICAL_SLUG = 'ricoh-mp-55xx-series';

const WEBP_QUALITY = 82;
const MAX_EDGE = 1200;
const CARD_VARIANTS = [
  { suffix: '-256', width: 256 },
  { suffix: '-512', width: 512 },
];

const TARGET_PRODUCTS = [
  { id: '9b94a5c0-f07d-42d6-bf0a-0a08afb7812c', model: 'MP 2555' },
  { id: 'ad23e3ac-84c6-4a54-9d84-64bf6990c418', model: 'MP 3055' },
  { id: 'c3be1bb4-4943-4af6-b85e-03be836cc111', model: 'MP 3555' },
  { id: 'ad426356-30b8-4c6c-a55c-b40bb22a495b', model: 'MP 6055' },
];

async function exportProductWebp(input, filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const rotated = await sharp(input).rotate().toBuffer();
  let trimmed = rotated;
  try {
    trimmed = await sharp(rotated).trim({ threshold: 12 }).toBuffer();
  } catch {
    trimmed = rotated;
  }

  const resized = await sharp(trimmed)
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: '/products/ricoh-mp-55xx-series',
  });

  const output = await sharp(watermarked).webp({ quality: WEBP_QUALITY }).toBuffer();
  await fs.writeFile(filePath, output);

  const parsed = path.parse(filePath);
  for (const { suffix, width } of CARD_VARIANTS) {
    const variantPath = path.join(parsed.dir, `${parsed.name}${suffix}.webp`);
    const variant = await sharp(output)
      .resize(width, width, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await fs.writeFile(variantPath, variant);
  }

  return filePath;
}

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
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    stock: row.stock ?? 0,
    category: row.category,
    brand: row.brand,
    created_at: row.created_at,
    sort_order: row.sort_order ?? 0,
    attributes: Array.isArray(row.attributes) ? row.attributes : [],
  });
}

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sourceBuffer = await fs.readFile(SOURCE_IMAGE);
  const publicDir = getPublicProductsDir();

  const canonicalPath = path.join(publicDir, `${CANONICAL_SLUG}.webp`);
  await exportProductWebp(sourceBuffer, canonicalPath);
  console.log(`✓ Imagen canónica: /products/${CANONICAL_SLUG}.webp`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const updatedProducts = [];

  for (const target of TARGET_PRODUCTS) {
    const publicPath = publicProductMediaPath(target.id);
    const absolutePath = path.join(publicDir, path.basename(publicPath));
    await exportProductWebp(sourceBuffer, absolutePath);
    console.log(`✓ ${target.model}: ${publicPath}`);

    const { data: row, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', target.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) {
      console.warn(`⚠ Producto no encontrado: ${target.id} (${target.model})`);
      continue;
    }

    const product = productFromRow(row);
    updatedProducts.push({
      ...product,
      image_url: publicPath,
      gallery: [],
    });
  }

  if (updatedProducts.length > 0) {
    await syncProductsToSupabase(updatedProducts);
    console.log(`\n✓ ${updatedProducts.length} productos actualizados en Supabase`);
    for (const product of updatedProducts) {
      console.log(`  · ${product.name}`);
    }
  }

  console.log('\nSiguiente paso: npm run build (incluye public/products en deploy)');
}

main().catch((error) => {
  console.error('\nError:', error.message ?? error);
  process.exit(1);
});
