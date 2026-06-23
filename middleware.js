import { injectSeoIntoHtml } from './shared/seo/inject-html.js';

export const config = {
  matcher: ['/', '/tienda', '/tienda/producto/:path*', '/categoria/:path*'],
};

let snapshotCache = null;
let snapshotLoadedAt = 0;
const SNAPSHOT_TTL_MS = 5 * 60 * 1000;

async function loadSnapshot(request) {
  const now = Date.now();
  if (snapshotCache && now - snapshotLoadedAt < SNAPSHOT_TTL_MS) {
    return snapshotCache;
  }

  const snapshotUrl = new URL('/catalog/seo-snapshot.json', request.url);
  const response = await fetch(snapshotUrl.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) return null;

  snapshotCache = await response.json();
  snapshotLoadedAt = now;
  return snapshotCache;
}

function resolveSeo(pathname, search, snapshot) {
  if (!snapshot) return null;

  const routeKey = search ? `${pathname}?${search}` : pathname;
  if (snapshot.routes?.[routeKey]) return snapshot.routes[routeKey];
  if (snapshot.routes?.[pathname]) return snapshot.routes[pathname];

  const productMatch = pathname.match(/^\/tienda\/producto\/([^/]+)$/);
  if (productMatch) {
    const lookup = decodeURIComponent(productMatch[1]).toLowerCase();
    return snapshot.productsByLookup?.[lookup] ?? null;
  }

  const categoryMatch = pathname.match(/^\/categoria\/([^/]+)$/);
  if (categoryMatch) {
    return snapshot.categories?.[categoryMatch[1]] ?? null;
  }

  if (pathname === '/') return snapshot.home ?? null;
  if (pathname === '/tienda') return snapshot.routes?.['/tienda'] ?? snapshot.categories?.multifuncionales ?? null;

  return null;
}

export default async function middleware(request) {
  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('text/html')) {
    return;
  }

  const url = new URL(request.url);
  const seo = resolveSeo(url.pathname, url.searchParams.toString(), await loadSnapshot(request));

  if (seo?.redirectTo) {
    return Response.redirect(new URL(seo.redirectTo, request.url), 301);
  }

  if (!seo) {
    return;
  }

  const indexUrl = new URL('/index.html', request.url);
  const indexResponse = await fetch(indexUrl.toString(), {
    headers: { Accept: 'text/html' },
  });

  if (!indexResponse.ok) {
    return;
  }

  const html = injectSeoIntoHtml(await indexResponse.text(), seo);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
