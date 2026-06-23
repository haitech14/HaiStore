import { resolveSiteOrigin } from '../../shared/site-origin.js';

const viteOrigin = import.meta.env.VITE_SITE_ORIGIN?.trim();

export const SITE_ORIGIN = resolveSiteOrigin({
  VITE_SITE_ORIGIN: viteOrigin,
});

export function buildAbsoluteUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN.replace(/\/+$/, '')}${path}`;
}

export function buildCanonicalUrl(pathname: string, search?: string): string {
  const query = search?.replace(/^\?/, '').trim();
  const path = query ? `${pathname}?${query}` : pathname;
  return buildAbsoluteUrl(path);
}
