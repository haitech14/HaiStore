export function isOwnedProductMediaPath(
  product: {
    id?: string;
    code?: string | null;
  },
  url: string,
): boolean;

export function isSyntheticProductMediaUrl(
  product: {
    id?: string;
    image_url?: string | null;
    gallery?: string[] | null;
  },
  url: string,
): boolean;

export function sanitizeStoredProductMedia(product: {
  image_url?: string | null;
  gallery?: string[] | null;
}): {
  image_url: string | null;
  gallery: string[];
};
