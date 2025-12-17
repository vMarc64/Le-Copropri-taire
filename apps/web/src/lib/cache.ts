"use client";

interface CacheEntry {
  data: unknown;
  timestamp: number;
  url: string;
}

interface CachedFetchOptions extends RequestInit {
  /** Cache TTL in milliseconds (default: 30 seconds) */
  ttl?: number;
  /** Force refresh, bypassing cache */
  forceRefresh?: boolean;
  /** Custom cache key (default: uses URL) */
  cacheKey?: string;
}

// Global cache store
const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

// Default TTL: 30 seconds
const DEFAULT_TTL = 30000;

/**
 * Get data from cache if valid
 */
export function getFromCache<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Store data in cache
 */
export function setInCache<T>(key: string, data: T, url?: string): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    url: url || key,
  });
}

/**
 * Invalidate specific cache entry
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Invalidate all cache entries matching a pattern
 */
export function invalidateCachePattern(pattern: string | RegExp): void {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    pending: Array.from(pendingRequests.keys()),
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      url: entry.url,
      age: Date.now() - entry.timestamp,
    })),
  };
}

/**
 * Fetch with automatic caching
 * 
 * @example
 * // Simple usage - caches by URL
 * const owners = await cachedFetch<Owner[]>('/api/owners');
 * 
 * // With custom TTL (1 minute)
 * const data = await cachedFetch('/api/stats', { ttl: 60000 });
 * 
 * // Force refresh
 * const fresh = await cachedFetch('/api/owners', { forceRefresh: true });
 * 
 * // Custom cache key (useful for normalized entities)
 * const owner = await cachedFetch('/api/owners/123', { 
 *   cacheKey: 'owner-123' 
 * });
 */
export async function cachedFetch<T>(
  url: string,
  options: CachedFetchOptions = {}
): Promise<T> {
  const { 
    ttl = DEFAULT_TTL, 
    forceRefresh = false, 
    cacheKey,
    ...fetchOptions 
  } = options;

  const key = cacheKey || url;

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getFromCache<T>(key, ttl);
    if (cached !== null) {
      return cached;
    }
  }

  // Check if request is already pending (deduplication)
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  // Make the request
  const promise = (async () => {
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store in cache
      setInCache(key, data, url);
      
      return data as T;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Prefetch data in the background (non-blocking)
 * 
 * @example
 * // Prefetch on hover
 * onMouseEnter={() => prefetch('/api/owners/123')}
 */
export function prefetch(url: string, options: CachedFetchOptions = {}): void {
  const key = options.cacheKey || url;
  
  // Already in cache or pending
  if (getFromCache(key, options.ttl) || pendingRequests.has(key)) {
    return;
  }

  // Fire and forget
  cachedFetch(url, options).catch((error) => {
    console.debug(`Prefetch failed for ${url}:`, error);
  });
}

/**
 * Prefetch multiple URLs in parallel
 */
export function prefetchAll(
  urls: string[], 
  options: CachedFetchOptions = {}
): void {
  urls.forEach(url => prefetch(url, options));
}

/**
 * Build a cache key from base and params
 */
export function buildCacheKey(
  base: string, 
  params: Record<string, unknown>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(key => params[key] !== undefined && params[key] !== '')
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return sortedParams ? `${base}?${sortedParams}` : base;
}

// ============================================
// Entity-specific helpers for common patterns
// ============================================

/**
 * Prefetch owner detail page
 */
export function prefetchOwner(ownerId: string): void {
  prefetch(`/api/owners/${ownerId}`, {
    cacheKey: `owner-${ownerId}`,
  });
}

/**
 * Prefetch condominium detail page
 */
export function prefetchCondominium(condominiumId: string): void {
  prefetch(`/api/condominiums/${condominiumId}`, {
    cacheKey: `condominium-${condominiumId}`,
  });
}

/**
 * Prefetch lot detail
 */
export function prefetchLot(lotId: string): void {
  prefetch(`/api/lots/${lotId}`, {
    cacheKey: `lot-${lotId}`,
  });
}

/**
 * Get owner from cache (without fetching)
 */
export function getOwnerFromCache<T>(ownerId: string): T | null {
  return getFromCache<T>(`owner-${ownerId}`);
}

/**
 * Get condominium from cache (without fetching)
 */
export function getCondominiumFromCache<T>(condominiumId: string): T | null {
  return getFromCache<T>(`condominium-${condominiumId}`);
}

/**
 * Store owner in cache (e.g., from list data)
 */
export function cacheOwner<T>(ownerId: string, data: T): void {
  setInCache(`owner-${ownerId}`, data);
}

/**
 * Store condominium in cache
 */
export function cacheCondominium<T>(condominiumId: string, data: T): void {
  setInCache(`condominium-${condominiumId}`, data);
}

// Debug helper - expose to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { __cache: typeof getCacheStats }).__cache = getCacheStats;
}
