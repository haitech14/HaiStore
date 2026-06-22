import { isImageMediaUrl } from './product-media.js';

function dedupeUrls(urls) {
  const seen = new Set();
  const result = [];
  for (const url of urls) {
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

/** Galería adicional sin la foto principal. */
export function getAdditionalGalleryUrls(imageUrl, gallery) {
  const main = typeof imageUrl === 'string' ? imageUrl.trim() : null;
  return (Array.isArray(gallery) ? gallery : []).filter(
    (url) => typeof url === 'string' && url.trim() && url.trim() !== main,
  );
}

/** Normaliza foto principal y galería sin duplicar la principal. */
export function normalizeProductGalleryFields(imageUrl, gallery) {
  const candidates = dedupeUrls([
    ...(Array.isArray(gallery) ? gallery : []),
    imageUrl ?? null,
  ]);

  const image_url =
    (typeof imageUrl === 'string' ? imageUrl.trim() : null) ??
    candidates.find((url) => isImageMediaUrl(url)) ??
    candidates[0] ??
    null;

  return {
    image_url,
    gallery: getAdditionalGalleryUrls(image_url, candidates),
  };
}
