/**
 * Resuelve una URL pública servible (Vercel /public) para vitrina y API.
 * Los data: URLs no se persisten en Supabase ni deben enviarse al cliente.
 */
import { publicProductMediaPath } from './persist-product-media.js';

export function resolveProductImageUrl(product) {
  const candidates = [
    product?.image_url,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ];

  for (const url of candidates) {
    if (typeof url === 'string' && url.length > 0 && !url.startsWith('data:')) {
      return url;
    }
  }

  return resolveProductStockImagePath(product);
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

export function resolveProductGallery(product) {
  const primary = resolveProductImageUrl(product);
  const fromGallery = (Array.isArray(product?.gallery) ? product.gallery : []).filter(
    (url) => typeof url === 'string' && url.length > 0 && !url.startsWith('data:'),
  );

  const merged = [...new Set([primary, ...fromGallery])];
  return merged.length > 0 ? merged : [primary];
}
