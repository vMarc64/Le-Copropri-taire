"use client";

import { useCallback } from "react";

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface UsePrefetchOptions {
  /** Cache TTL in milliseconds (default: 30 seconds) */
  cacheTTL?: number;
  /** Whether prefetching is enabled (default: true) */
  enabled?: boolean;
}

// Global cache shared across all components
const globalCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Get data from global cache (can be used outside of React components)
 */
export function getGlobalCache<T>(key: string, cacheTTL = 30000): T | null {
  const entry = globalCache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > cacheTTL;
  if (isExpired) {
    globalCache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Set data in global cache (can be used outside of React components)
 */
export function setGlobalCache<T>(key: string, data: T): void {
  globalCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Hook for prefetching and caching data for adjacent pages
 * Uses a global cache shared across all components
 * 
 * @example
 * const { getFromCache, prefetch, invalidateCache } = usePrefetch<Owner[]>();
 * 
 * // Check cache before fetching
 * const cached = getFromCache(`owners-page-${page}`);
 * if (cached) {
 *   setOwners(cached);
 * } else {
 *   const data = await fetchOwners(page);
 *   setOwners(data);
 * }
 * 
 * // Prefetch adjacent pages
 * prefetch(`owners-page-${page + 1}`, () => fetchOwners(page + 1));
 */
export function usePrefetch<T>(options: UsePrefetchOptions = {}) {
  const { cacheTTL = 30000, enabled = true } = options;

  /**
   * Get data from cache if valid
   */
  const getFromCache = useCallback((key: string): T | null => {
    return getGlobalCache<T>(key, cacheTTL);
  }, [cacheTTL]);

  /**
   * Store data in cache
   */
  const setCache = useCallback((key: string, data: T) => {
    setGlobalCache(key, data);
  }, []);

  /**
   * Prefetch data in the background
   */
  const prefetch = useCallback(async (
    key: string,
    fetcher: () => Promise<T>
  ): Promise<void> => {
    if (!enabled) return;
    
    // Already in cache and valid
    if (getGlobalCache(key, cacheTTL)) return;
    
    // Already being fetched
    if (pendingRequests.has(key)) return;
    
    try {
      const promise = fetcher();
      pendingRequests.set(key, promise);
      
      const data = await promise;
      setGlobalCache(key, data);
    } catch (error) {
      // Silently fail for prefetch - it's not critical
      console.debug(`Prefetch failed for ${key}:`, error);
    } finally {
      pendingRequests.delete(key);
    }
  }, [enabled, cacheTTL]);

  /**
   * Prefetch multiple pages around the current page
   */
  const prefetchAdjacent = useCallback(async (
    currentPage: number,
    totalPages: number,
    keyBuilder: (page: number) => string,
    fetcher: (page: number) => Promise<T>
  ): Promise<void> => {
    if (!enabled) return;

    const pagesToPrefetch: number[] = [];
    
    // Previous page
    if (currentPage > 1) {
      pagesToPrefetch.push(currentPage - 1);
    }
    
    // Next page
    if (currentPage < totalPages) {
      pagesToPrefetch.push(currentPage + 1);
    }

    // Prefetch all adjacent pages in parallel
    await Promise.all(
      pagesToPrefetch.map(page => 
        prefetch(keyBuilder(page), () => fetcher(page))
      )
    );
  }, [enabled, prefetch]);

  /**
   * Invalidate specific cache entry
   */
  const invalidateCache = useCallback((key: string) => {
    globalCache.delete(key);
  }, []);

  /**
   * Invalidate all cache entries matching a pattern
   */
  const invalidateCachePattern = useCallback((pattern: string | RegExp) => {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of globalCache.keys()) {
      if (regex.test(key)) {
        globalCache.delete(key);
      }
    }
  }, []);

  /**
   * Clear all cache
   */
  const clearCache = useCallback(() => {
    globalCache.clear();
  }, []);

  /**
   * Get cache stats for debugging
   */
  const getCacheStats = useCallback(() => ({
    size: globalCache.size,
    keys: Array.from(globalCache.keys()),
    pending: Array.from(pendingRequests.keys()),
  }), []);

  return {
    getFromCache,
    setCache,
    prefetch,
    prefetchAdjacent,
    invalidateCache,
    invalidateCachePattern,
    clearCache,
    getCacheStats,
  };
}

/**
 * Build a cache key from parameters
 */
export function buildCacheKey(base: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(key => params[key] !== undefined && params[key] !== '')
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return sortedParams ? `${base}?${sortedParams}` : base;
}
