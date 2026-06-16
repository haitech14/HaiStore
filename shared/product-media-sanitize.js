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

/** URL de stock / placeholder, no subida por el usuario. */
export function isSyntheticProductMediaUrl(product, url) {
  if (typeof url !== 'string' || url.length === 0) return true;
  if (url.startsWith('data:')) return false;

  const stored = storedMediaUrls(product);
  const id = sanitizeProductId(product?.id);
  const mainPath = id ? publicProductMediaPath(product.id) : null;

  // Medios persistidos en inventario (subida del usuario o importación).
  if (stored.includes(url)) {
    if (isCategoryStockImageUrl(url)) return true;
    if (mainPath && url === mainPath) return false;
    if (id && new RegExp(`^/products/${id}-\\d+\\.webp$`, 'i').test(url)) return true;
    if (url.startsWith('/products/')) return false;
    return false;
  }

  if (url === resolveProductModelStockImage(product)) return true;
  if (url === resolveProductCategoryStockImage(product)) return true;
  if (isCategoryStockImageUrl(url)) return true;

  if (id) {
    if (new RegExp(`^/products/${id}-\\d+\\.webp$`, 'i').test(url)) return true;
    if (mainPath && url === mainPath) return true;
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

/** Deja solo la primera imagen real guardada (sin placeholders ni galería extra). */
export function sanitizeStoredProductMedia(product) {
  const candidates = dedupeUrls([
    product?.image_url,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ]);

  const authentic = candidates.filter((url) => !isSyntheticProductMediaUrl(product, url));
  const image_url = authentic[0] ?? null;

  return {
    image_url,
    gallery: image_url ? [image_url] : [],
  };
}
