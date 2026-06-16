import {
  publicProductMediaPath,
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
  sanitizeProductId,
} from '@/lib/product-stock-images';

type ProductMediaSource = {
  id?: string;
  code?: string | null;
  name?: string;
  category?: string | null;
  brand?: string | null;
  image_url?: string | null;
  gallery?: string[] | null;
};

function isCategoryStockImageUrl(url: string): boolean {
  return (
    url.startsWith('/categories/') ||
    url.startsWith('/promotions/') ||
    url.startsWith('/promo-cards/')
  );
}

function storedMediaUrls(product: ProductMediaSource): string[] {
  return dedupeUrls([product.image_url, ...(product.gallery ?? [])]);
}

export function isSyntheticProductMediaUrl(product: ProductMediaSource, url: string): boolean {
  if (!url) return true;
  if (url.startsWith('data:')) return false;

  const stored = storedMediaUrls(product);
  const id = sanitizeProductId(product.id);
  const mainPath = id ? publicProductMediaPath(product.id) : null;

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

function dedupeUrls(urls: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}

export function sanitizeStoredProductMedia(
  product: ProductMediaSource,
): { image_url: string | null; gallery: string[] } {
  const candidates = dedupeUrls([product.image_url, ...(product.gallery ?? [])]);
  const authentic = candidates.filter((url) => !isSyntheticProductMediaUrl(product, url));
  const image_url = authentic[0] ?? null;

  return {
    image_url,
    gallery: image_url ? [image_url] : [],
  };
}
