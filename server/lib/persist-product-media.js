import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WEBP_QUALITY = 82;
const MAX_EDGE = 1200;

export function getPublicProductsDir() {
  if (process.env.HAISTORE_PUBLIC_PRODUCTS_DIR) {
    return process.env.HAISTORE_PUBLIC_PRODUCTS_DIR;
  }
  return path.join(__dirname, '../../public/products');
}

function sanitizeProductId(productId) {
  return String(productId ?? 'product')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function publicProductMediaPath(productId, index = 0) {
  const base = sanitizeProductId(productId);
  const suffix = index > 0 ? `-${index + 1}` : '';
  return `/products/${base}${suffix}.webp`;
}

async function exportDataUrlToFile(dataUrl, filePath) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
  if (!base64) return false;

  const input = Buffer.from(base64, 'base64');
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const output = await sharp(input)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await fs.writeFile(filePath, output);
  return true;
}

/**
 * Convierte data: URLs del producto en archivos estáticos en public/products
 * y sustituye las referencias por rutas públicas servibles en Vercel.
 */
export async function persistProductMedia(product) {
  if (!product?.id) return product;

  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : [];
  const sourceUrls =
    gallery.length > 0
      ? gallery
      : typeof product.image_url === 'string' && product.image_url.length > 0
        ? [product.image_url]
        : [];

  if (sourceUrls.length === 0) return product;

  const publicDir = getPublicProductsDir();
  const nextGallery = [];

  for (let index = 0; index < sourceUrls.length; index += 1) {
    const url = sourceUrls[index];
    if (url.startsWith('data:image/')) {
      const publicPath = publicProductMediaPath(product.id, index);
      const absolutePath = path.join(publicDir, path.basename(publicPath));
      try {
        await exportDataUrlToFile(url, absolutePath);
        nextGallery.push(publicPath);
      } catch (error) {
        console.warn('[persist-media]', product.id, error?.message ?? error);
        nextGallery.push(url);
      }
      continue;
    }

    if (!url.startsWith('data:')) {
      nextGallery.push(url);
    }
  }

  const image_url = nextGallery[0] ?? null;
  return {
    ...product,
    image_url,
    gallery: nextGallery.length > 0 ? nextGallery : image_url ? [image_url] : [],
  };
}

export async function persistProductsMedia(products) {
  if (!Array.isArray(products)) return [];
  const persisted = [];
  for (const product of products) {
    persisted.push(await persistProductMedia(product));
  }
  return persisted;
}
