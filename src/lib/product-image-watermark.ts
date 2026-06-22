export const HAITECH_WATERMARK_SRC = '/brand/haitech-watermark.png';

export function shouldWatermarkProductImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('/products/')) return true;
  return false;
}

/** Overlay en catálogo solo para vistas previas antes de persistir. */
export function shouldShowProductImageWatermarkOverlay(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return url.startsWith('data:image/');
}
