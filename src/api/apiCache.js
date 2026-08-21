/**
 * Lightweight in-memory API cache.
 *
 * Stores GET responses keyed by URL so that repeated fetches within the
 * configured TTL return instantly without hitting the network.
 *
 * Usage:
 *   import { cachedGet, invalidateCache } from './apiCache';
 *   const data = await cachedGet('/barang');          // cached 5 min
 *   invalidateCache('/barang');                        // bust after mutation
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const cache = new Map();

/**
 * Build a deterministic cache key from path + optional params.
 */
const buildKey = (path, params) => {
  if (!params || Object.keys(params).length === 0) {
    return path;
  }

  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return sorted ? `${path}?${sorted}` : path;
};

/**
 * Return a cached Axios-like response if still fresh, otherwise call
 * `fetchFn` and store the result.
 *
 * @param {string}   path      API path, e.g. '/barang'
 * @param {Function} fetchFn   () => Promise<AxiosResponse>  — the actual API call
 * @param {object}   [opts]
 * @param {object}   [opts.params]   Query params for cache key
 * @param {number}   [opts.ttl]      TTL in ms (default 5 min)
 */
export const cachedGet = async (path, fetchFn, opts = {}) => {
  const { params, ttl = DEFAULT_TTL_MS } = opts;
  const key = buildKey(path, params);

  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < ttl) {
    return entry.data;
  }

  const data = await fetchFn();

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  return data;
};

/**
 * Invalidate one key, a pattern, or the entire cache.
 *
 * @param {string} [pathPrefix]  If provided, all keys starting with this
 *                               prefix are removed. If omitted, the
 *                               entire cache is cleared.
 */
export const invalidateCache = (pathPrefix) => {
  if (!pathPrefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key === pathPrefix || key.startsWith(pathPrefix + "?") || key.startsWith(pathPrefix + "/")) {
      cache.delete(key);
    }
  }

  // Also delete exact match
  cache.delete(pathPrefix);
};

/**
 * Get current cache size (for debugging).
 */
export const getCacheSize = () => cache.size;
