export type ResolveProductImageOptions = {
  /** Vista admin: permite previsualizar data: URL antes de persistir en disco. */
  allowDataUrl?: boolean;
};

/** URL pública para mostrar un producto (evita data: URLs que no persisten en Supabase). */
export function resolveProductImageUrl(
  product: {
    image_url?: string | null;
    gallery?: string[] | null;
    id?: string;
    name?: string;
    category?: string | null;
    brand?: string | null;
  },
  options?: ResolveProductImageOptions,
): string {
  const candidates = [
    product.image_url,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ];

  for (const url of candidates) {
    if (typeof url !== 'string' || url.length === 0) continue;
    if (url.startsWith('data:') && !options?.allowDataUrl) continue;
    return url;
  }

  return resolveProductStockImagePath(product);
}

export function resolveProductStockImagePath(product: {
  id?: string;
  name?: string;
  category?: string | null;
  brand?: string | null;
}): string {
  const id = String(product.id ?? '').trim();
  if (id) {
    return `/products/${id.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.webp`;
  }

  const haystack = `${product.category ?? ''} ${product.name ?? ''} ${product.brand ?? ''}`.toLowerCase();

  if (product.category === 'Accesorios' || haystack.startsWith('accesorios ')) {
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
