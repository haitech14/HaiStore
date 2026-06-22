import {
  isImageMediaUrl,
  isVideoMediaUrl,
  isYoutubeMediaUrl,
} from './product-media.js';
import {
  publicProductMediaPath,
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
  sanitizeProductId,
} from './product-stock-images.js';

function isCategoryStockImageUrl(url) {
  return (
    url.startsWith('/categories/') ||
    url.startsWith('/promotions/') ||
    url.startsWith('/promo-cards/')
  );
}

function storedMediaUrls(product) {
  return dedupeUrls([
    product?.image_url,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ]);
}

function productMediaFilenameStem(url) {
  const match = String(url).match(/^\/products\/(.+)\.webp$/i);
  return match ? match[1].toLowerCase() : null;
}

function ownedProductMediaStems(product) {
  const stems = new Set();
  const id = sanitizeProductId(product?.id);
  if (id) stems.add(id);

  const code = String(product?.code ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (code) stems.add(`toner-${code}`);

  return stems;
}

/** Imagen en /products/ que pertenece a este producto (no tomada de otro ítem). */
export function isOwnedProductMediaPath(product, url) {
  if (!String(url).startsWith('/products/')) return true;

  const stem = productMediaFilenameStem(url);
  if (!stem) return false;

  const owned = ownedProductMediaStems(product);
  if (owned.has(stem)) return true;

  for (const own of owned) {
    if (stem.startsWith(`${own}-`)) return true;
  }

  return false;
}

/** URL de stock / placeholder, no subida por el usuario. */
export function isSyntheticProductMediaUrl(product, url) {
  if (typeof url !== 'string' || url.length === 0) return true;
  if (url.startsWith('data:')) return false;

  const stored = storedMediaUrls(product);

  // Medios persistidos en inventario (subida del usuario o importación).
  if (stored.includes(url)) {
    if (isCategoryStockImageUrl(url)) return true;
    if (isYoutubeMediaUrl(url) || isVideoMediaUrl(url)) return false;
    if (url.startsWith('/products/')) return !isOwnedProductMediaPath(product, url);
    if (url.startsWith('http://') || url.startsWith('https://')) return false;
    return false;
  }

  if (url === resolveProductModelStockImage(product)) return true;
  if (url === resolveProductCategoryStockImage(product)) return true;
  if (isCategoryStockImageUrl(url)) return true;

  if (url.startsWith('/products/') && !isOwnedProductMediaPath(product, url)) return true;

  const id = sanitizeProductId(product?.id);
  const mainPath = id ? publicProductMediaPath(product.id) : null;

  if (id) {
    if (mainPath && url === mainPath) return true;
    if (new RegExp(`^/products/${id}-\\d+\\.webp$`, 'i').test(url)) return true;
  }

  return false;
}

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

/** Conserva la galería real guardada (sin placeholders de catálogo). */
export function sanitizeStoredProductMedia(product) {
  const candidates = dedupeUrls([
    product?.image_url,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ]);

  const authentic = candidates.filter((url) => !isSyntheticProductMediaUrl(product, url));
  const images = authentic.filter(isImageMediaUrl);
  const image_url = images[0] ?? null;

  return {
    image_url,
    gallery: authentic,
  };
}
