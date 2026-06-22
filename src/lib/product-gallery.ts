import { isImageMediaUrl } from '@/lib/product-media';

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

/** Normaliza foto principal y galería sin duplicar la principal en la galería. */
export function normalizeProductGalleryFields(
  imageUrl: string | null | undefined,
  gallery: string[] | null | undefined,
): { image_url: string | null; gallery: string[] } {
  const candidates = dedupeUrls([
    ...(Array.isArray(gallery) ? gallery : []),
    imageUrl ?? null,
  ]);

  const image_url =
    imageUrl?.trim() ??
    candidates.find((url) => isImageMediaUrl(url)) ??
    candidates[0] ??
    null;

  return {
    image_url,
    gallery: getAdditionalGalleryUrls(image_url, candidates),
  };
}

function dedupeUrls(urls: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}
