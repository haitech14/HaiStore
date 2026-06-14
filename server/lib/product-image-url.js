/**
 * Resuelve una URL pública servible (Vercel /public) para vitrina y API.
 * Los data: URLs no se persisten en Supabase ni deben enviarse al cliente.
 */
import { publicProductMediaPath } from './persist-product-media.js';

function shouldUseStockFallback(options) {
  if (options?.stockFallback === false) return false;
  if (options?.stockFallback === true) return true;
  // En Vercel no hay /products/{id}.webp generados por slug; evita 404 y placeholders falsos.
  return !process.env.VERCEL;
}

export function resolveProductStockImagePath(product) {
  const id = String(product?.id ?? '').trim();
  if (id) {
    return publicProductMediaPath(id);
  }

  const haystack = `${product?.category ?? ''} ${product?.name ?? ''} ${product?.brand ?? ''}`.toLowerCase();

  if (product?.category === 'Accesorios' || haystack.startsWith('accesorios ')) {
    return '/categories/accesorios-impresoras.png';
  }

  if (haystack.includes('multifuncional')) {
    if (haystack.includes('remanufactur') || haystack.includes('reacondicion')) {
      return '/promotions/promo-hero-multifuncionales.png';
    }
    return '/categories/multifuncionales.png';
  }

  if (haystack.includes('impresor')) {
    return '/categories/impresoras.png';
  }

  if (
    haystack.includes('toner') ||
    haystack.includes('tóner') ||
    haystack.includes('suministro') ||
    haystack.includes('repuesto')
  ) {
    return '/categories/toner-suministros.png';
  }

  return '/promo-cards/b2b-printer.png';
}

function isSyntheticStockImageUrl(product, url) {
  if (typeof url !== 'string' || url.length === 0) return false;
  return url === resolveProductStockImagePath(product);
}

function isUsableProductImageUrl(product, url, options) {
  if (typeof url !== 'string' || url.length === 0) return false;
  if (url.startsWith('data:')) return false;
  if (!shouldUseStockFallback(options) && isSyntheticStockImageUrl(product, url)) return false;
  return true;
}

export function resolveProductImageUrl(product, options) {
  const candidates = [
    product?.image_url,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ];

  for (const url of candidates) {
    if (isUsableProductImageUrl(product, url, options)) {
      return url;
    }
  }

  if (!shouldUseStockFallback(options)) return null;
  return resolveProductStockImagePath(product);
}

export function resolveProductGallery(product, options) {
  const fromGallery = (Array.isArray(product?.gallery) ? product.gallery : []).filter((url) =>
    isUsableProductImageUrl(product, url, options),
  );
  const primary = resolveProductImageUrl(product, options);

  if (primary) {
    return [...new Set([primary, ...fromGallery])];
  }

  return fromGallery;
}
