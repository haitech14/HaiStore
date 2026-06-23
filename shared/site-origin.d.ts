export const DEFAULT_SITE_ORIGIN: string;

export function resolveSiteOrigin(env?: Record<string, string | undefined>): string;
export function buildAbsoluteUrl(pathname: string, siteOrigin?: string): string;
