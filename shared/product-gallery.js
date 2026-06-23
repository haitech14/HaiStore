import { isImageMediaUrl } from './product-media.js';
import { mergeDuplicateProductMediaUrls } from './product-media-dedupe.js';

/** Galería adicional sin la foto principal. */
export function getAdditionalGalleryUrls(imageUrl, gallery) {
  const main = typeof imageUrl === 'string' ? imageUrl.trim() : null;
  const seen = new Set();
  /** @type {string[]} */
  const result = [];

  for (const url of gallery ?? []) {
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!trimmed || trimmed === main || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

/** Normaliza foto principal y galería sin duplicar la principal ni variantes responsive. */
export function normalizeProductGalleryFields(imageUrl, gallery) {
  /** @type {string[]} */
  const ordered = [];
  const seen = new Set();

  const add = (url) => {
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    ordered.push(trimmed);
  };

  add(imageUrl);
  for (const url of gallery ?? []) add(url);

  const merged = mergeDuplicateProductMediaUrls(ordered);
  const explicitMain = typeof imageUrl === 'string' ? imageUrl.trim() : null;
  const image_url =
    explicitMain && merged.includes(explicitMain)
      ? explicitMain
      : merged.find((url) => isImageMediaUrl(url)) ?? merged[0] ?? null;

  return {
    image_url,
    gallery: getAdditionalGalleryUrls(image_url, merged),
  };
}

/** Asigna solo la foto principal sin añadirla a la galería. */
export function setProductMainImageUrl(imageUrl, gallery, newMainUrl) {
  const main = typeof newMainUrl === 'string' ? newMainUrl.trim() : null;
  return {
    image_url: main || null,
    gallery: getAdditionalGalleryUrls(main || null, gallery),
  };
}

/** Añade URLs solo a la galería adicional, sin modificar la foto principal. */
export function appendProductGalleryUrls(imageUrl, gallery, urls) {
  const main = typeof imageUrl === 'string' ? imageUrl.trim() : null;
  const current = getAdditionalGalleryUrls(main, gallery);
  const seen = new Set(current);
  const additions = [];

  for (const url of urls) {
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!trimmed || trimmed === main || seen.has(trimmed)) continue;
    seen.add(trimmed);
    additions.push(trimmed);
  }

  return {
    image_url: main || null,
    gallery: [...current, ...additions],
  };
}
