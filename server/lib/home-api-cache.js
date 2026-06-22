const HOME_API_CACHE_TTL_MS = 5 * 60 * 1000;

/** @type {Map<string, { value: unknown; at: number }>} */
const entries = new Map();

export function invalidateHomeApiCache() {
  entries.clear();
}

/**
 * Caché en memoria para respuestas de la home (evita recomputar sobre todo el inventario).
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} loader
 */
export async function getHomeApiCache(key, loader) {
  const now = Date.now();
  const hit = entries.get(key);
  if (hit && now - hit.at < HOME_API_CACHE_TTL_MS) {
    return /** @type {T} */ (hit.value);
  }

  const value = await loader();
  entries.set(key, { value, at: now });
  return value;
}
