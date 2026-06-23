import { isImageMediaUrl } from '@/lib/product-media';
import { mergeDuplicateProductMediaUrls } from '../../shared/product-media-dedupe.js';

/** URLs de galería adicional (sin la foto principal). */
export function getAdditionalGalleryUrls(
  imageUrl: string | null | undefined,
  gallery: string[] | null | undefined,
): string[] {
  const main = imageUrl?.trim() ?? null;
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of gallery ?? []) {
    const trimmed = url?.trim();
    if (!trimmed || trimmed === main || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

/** Normaliza foto principal y galería sin duplicar la principal ni variantes responsive. */
export function normalizeProductGalleryFields(
  imageUrl: string | null | undefined,
  gallery: string[] | null | undefined,
): { image_url: string | null; gallery: string[] } {
  const ordered: string[] = [];
  const seen = new Set<string>();

  const add = (url: string | null | undefined) => {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    ordered.push(trimmed);
  };

  add(imageUrl);
  for (const url of gallery ?? []) add(url);

  const merged = mergeDuplicateProductMediaUrls(ordered);
  const explicitMain = imageUrl?.trim() ?? null;
  const image_url =
    explicitMain && merged.includes(explicitMain)
      ? explicitMain
      : merged.find((url: string) => isImageMediaUrl(url)) ?? merged[0] ?? null;

  return {
    image_url,
    gallery: getAdditionalGalleryUrls(image_url, merged),
  };
}

/** Asigna solo la foto principal sin añadirla a la galería. */
export function setProductMainImageUrl(
  _imageUrl: string | null | undefined,
  gallery: string[] | null | undefined,
  newMainUrl: string | null,
): { image_url: string | null; gallery: string[] } {
  const main = newMainUrl?.trim() ?? null;
  return {
    image_url: main,
    gallery: getAdditionalGalleryUrls(main, gallery),
  };
}

/** Añade URLs solo a la galería adicional, sin modificar la foto principal. */
export function appendProductGalleryUrls(
  imageUrl: string | null | undefined,
  gallery: string[] | null | undefined,
  urls: string[],
): { image_url: string | null; gallery: string[] } {
  const main = imageUrl?.trim() ?? null;
  const current = getAdditionalGalleryUrls(main, gallery);
  const seen = new Set(current);

  const additions: string[] = [];
  for (const url of urls) {
    const trimmed = url?.trim();
    if (!trimmed || trimmed === main || seen.has(trimmed)) continue;
    seen.add(trimmed);
    additions.push(trimmed);
  }

  return {
    image_url: main,
    gallery: [...current, ...additions],
  };
}

export { mergeDuplicateProductMediaUrls, productMediaCanonicalKey } from '../../shared/product-media-dedupe.js';
