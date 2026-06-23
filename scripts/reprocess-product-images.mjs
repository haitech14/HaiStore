/**
 * Recorta márgenes blancos, reoptimiza WebP y regenera variantes -256/-512 en public/products.
 * Uso: node scripts/reprocess-product-images.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import { getPublicProductsDir } from '../server/lib/persist-product-media.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsDir = getPublicProductsDir();
const dryRun = process.argv.includes('--dry-run');

const WEBP_QUALITY = 82;
const MAX_EDGE = 1200;
const RESPONSIVE_WIDTHS = [256, 512];
const VARIANT_SUFFIX = /-(256|512|768|1280|1920)\.webp$/i;

/** @param {string} filePath */
function kb(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return Math.round((fs.statSync(filePath).size / 1024) * 10) / 10;
}

/** @param {Buffer} input */
async function trimBuffer(input) {
  try {
    return await sharp(input).trim({ threshold: 12 }).toBuffer();
  } catch {
    return input;
  }
}

/** @param {Buffer} input */
async function optimizeMainBuffer(input) {
  const rotated = await sharp(input).rotate().toBuffer();
  const trimmed = await trimBuffer(rotated);
  const resized = await sharp(trimmed)
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  return applyHaitechWatermark(resized, { sourceUrl: '/products/reprocess' });
}

/** @param {string} basePath sin extensión */
async function writeResponsiveVariants(sourceBuffer, basePath) {
  for (const width of RESPONSIVE_WIDTHS) {
    const out = `${basePath}-${width}.webp`;
    if (dryRun) {
      console.log(`  · generaría ${path.relative(root, out)}`);
      continue;
    }
    await sharp(sourceBuffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(out);
  }
}

/** @param {string} filePath */
function isSourceProductImage(filePath) {
  const base = path.basename(filePath);
  if (!/\.(webp|png|jpe?g)$/i.test(base)) return false;
  if (VARIANT_SUFFIX.test(base)) return false;
  if (/-\d+\.webp$/i.test(base) && !VARIANT_SUFFIX.test(base)) {
    // galería `-2.webp`, `-3.webp` — reprocesar también
    return true;
  }
  return true;
}

/** @param {string} filePath */
async function reprocessFile(filePath) {
  const parsed = path.parse(filePath);
  const beforeKb = kb(filePath);
  const mainWebpPath = path.join(parsed.dir, `${parsed.name}.webp`);

  if (dryRun) {
    console.log(`→ ${path.relative(root, filePath)} (${beforeKb} KB)`);
    await writeResponsiveVariants(Buffer.alloc(0), path.join(parsed.dir, parsed.name));
    return { updated: true, beforeKb, afterKb: beforeKb };
  }

  const input = await fs.promises.readFile(filePath);
  const optimized = await optimizeMainBuffer(input);
  await fs.promises.writeFile(mainWebpPath, await sharp(optimized).webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer());

  if (mainWebpPath !== filePath && /\.(png|jpe?g)$/i.test(parsed.ext)) {
    // Mantener PNG/JPG originales como respaldo; variantes desde el WebP optimizado.
  }

  const mainBuffer = await fs.promises.readFile(mainWebpPath);
  await writeResponsiveVariants(mainBuffer, path.join(parsed.dir, parsed.name));

  const afterKb = kb(mainWebpPath);
  return { updated: true, beforeKb, afterKb };
}

async function dedupeInventoryMedia() {
  const inventoryPath = path.join(root, 'server/data/inventory.json');
  if (!fs.existsSync(inventoryPath)) return;

  const { normalizeProductGalleryFields } = await import('../shared/product-gallery.js');
  const data = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  if (!Array.isArray(data.products)) return;

  let changed = 0;
  for (const product of data.products) {
    const before = JSON.stringify({ image_url: product.image_url, gallery: product.gallery });
    const normalized = normalizeProductGalleryFields(product.image_url, product.gallery);
    product.image_url = normalized.image_url;
    product.gallery = normalized.gallery;
    if (JSON.stringify({ image_url: product.image_url, gallery: product.gallery }) !== before) {
      changed += 1;
    }
  }

  if (changed > 0 && !dryRun) {
    fs.writeFileSync(inventoryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
  console.log(`\nInventario: ${changed} producto(s) con galería deduplicada${dryRun ? ' (simulación)' : ''}.`);
}

async function main() {
  if (!fs.existsSync(productsDir)) {
    console.log('Sin carpeta public/products.');
    return;
  }

  const files = fs
    .readdirSync(productsDir)
    .filter((name) => isSourceProductImage(path.join(productsDir, name)))
    .map((name) => path.join(productsDir, name));

  console.log(`${dryRun ? 'Simulación' : 'Reprocesando'} ${files.length} imagen(es) en public/products…`);

  let updated = 0;
  for (const filePath of files) {
    try {
      const result = await reprocessFile(filePath);
      if (result.updated) {
        updated += 1;
        if (!dryRun) {
          console.log(
            `✓ ${path.relative(root, filePath)} (${result.beforeKb} KB → ${result.afterKb} KB WebP)`,
          );
        }
      }
    } catch (error) {
      console.warn(`⚠ ${path.relative(root, filePath)}: ${error?.message ?? error}`);
    }
  }

  console.log(`\nImágenes reprocesadas: ${updated}${dryRun ? ' (simulación)' : ''}.`);
  await dedupeInventoryMedia();
}

await main();
