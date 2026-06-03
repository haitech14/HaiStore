const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

/** @type {Map<string, number[]>} */
const hits = new Map();

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

export function isSupportRateLimited(clientKey) {
  const now = Date.now();
  const bucket = hits.get(clientKey) ?? [];
  const recent = bucket.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(clientKey, recent);
    return true;
  }

  recent.push(now);
  hits.set(clientKey, recent);
  return false;
}
