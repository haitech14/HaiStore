import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

import { applyHaitechWatermark } from './image-watermark.js';
import {
  isVideoMediaUrl,
  isYoutubeMediaUrl,
  normalizeYoutubeMediaUrl,
} from '../../shared/product-media.js';

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

export function publicProductVideoPath(productId, videoIndex = 0) {
  const base = sanitizeProductId(productId);
  const suffix = videoIndex > 0 ? `-video-${videoIndex + 1}` : '-video';
  return `/products/${base}${suffix}.mp4`;
}

function countPersistedImages(urls) {
  return urls.filter(
    (url) =>
      typeof url === 'string' &&
      !isYoutubeMediaUrl(url) &&
      !isVideoMediaUrl(url) &&
      !url.startsWith('data:'),
  ).length;
}

function countPersistedVideos(urls) {
  return urls.filter(
    (url) => typeof url === 'string' && (isVideoMediaUrl(url) || url.startsWith('data:video/')),
  ).length;
}

async function exportDataUrlToFile(dataUrl, filePath) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
  if (!base64) return false;

  const input = Buffer.from(base64, 'base64');
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const resized = await sharp(input)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: '/products/upload',
  });

  const output = await sharp(watermarked)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await fs.writeFile(filePath, output);
  return true;
}

async function exportVideoDataUrlToFile(dataUrl, filePath) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
  if (!base64) return false;

  const input = Buffer.from(base64, 'base64');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, input);
  return true;
}

function resolvePersistedUrl(url) {
  if (isYoutubeMediaUrl(url)) return url;
  const normalizedYoutube = normalizeYoutubeMediaUrl(url);
  if (normalizedYoutube) return normalizedYoutube;
  if (!url.startsWith('data:')) return url;
  return null;
}

/**
 * Convierte data: URLs del producto en archivos estáticos en public/products
 * y sustituye las referencias por rutas públicas servibles en Vercel.
 */
function dedupeUrls(urls) {
  const seen = new Set();
  const result = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}

export async function persistProductMedia(product) {
  if (!product?.id) return product;

  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : [];
  const sourceUrls = dedupeUrls([
    typeof product.image_url === 'string' ? product.image_url : null,
    ...gallery,
  ]).filter(Boolean);

  if (sourceUrls.length === 0) return product;

  const publicDir = getPublicProductsDir();
  const nextGallery = [];

  for (const url of sourceUrls) {
    const persisted = resolvePersistedUrl(url);
    if (persisted) {
      nextGallery.push(persisted);
      continue;
    }

    if (url.startsWith('data:image/')) {
      const imageIndex = countPersistedImages(nextGallery);
      const publicPath = publicProductMediaPath(product.id, imageIndex);
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

    if (url.startsWith('data:video/')) {
      const videoIndex = countPersistedVideos(nextGallery);
      const publicPath = publicProductVideoPath(product.id, videoIndex);
      const absolutePath = path.join(publicDir, path.basename(publicPath));
      try {
        await exportVideoDataUrlToFile(url, absolutePath);
        nextGallery.push(publicPath);
      } catch (error) {
        console.warn('[persist-media]', product.id, error?.message ?? error);
        nextGallery.push(url);
      }
    }
  }

  const image_url =
    nextGallery.find(
      (entry) => !isYoutubeMediaUrl(entry) && !isVideoMediaUrl(entry),
    ) ?? null;

  const additionalGallery = nextGallery.filter((entry) => entry !== image_url);

  return {
    ...product,
    image_url,
    gallery: additionalGallery.length > 0 ? additionalGallery : [],
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
