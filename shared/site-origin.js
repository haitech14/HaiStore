/** Dominio canónico del sitio (sin barra final). */
export const DEFAULT_SITE_ORIGIN = 'https://www.haitech.pe';

export function resolveSiteOrigin(env = process.env) {
  const fromEnv =
    env.VITE_SITE_ORIGIN?.trim() ||
    env.SITE_ORIGIN?.trim() ||
    env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (!fromEnv) return DEFAULT_SITE_ORIGIN;
  const withProtocol = /^https?:\/\//i.test(fromEnv) ? fromEnv : `https://${fromEnv}`;
  return withProtocol.replace(/\/+$/, '');
}

export function buildAbsoluteUrl(pathname, siteOrigin = DEFAULT_SITE_ORIGIN) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${siteOrigin.replace(/\/+$/, '')}${path}`;
}
