"use client";

import { useRef, useCallback, useEffect } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UsePrefetchOptions {
  /** Cache TTL in milliseconds (default: 30 seconds) */
  cacheTTL?: number;
  /** Whether prefetching is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook for prefetching and caching data for adjacent pages
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
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const pendingRequests = useRef<Map<string, Promise<T>>>(new Map());

  /**
   * Get data from cache if valid
   */
  const getFromCache = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > cacheTTL;
    if (isExpired) {
      cache.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, [cacheTTL]);

  /**
   * Store data in cache
   */
  const setCache = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
    });
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
    if (getFromCache(key)) return;
    
    // Already being fetched
    if (pendingRequests.current.has(key)) return;
    
    try {
      const promise = fetcher();
      pendingRequests.current.set(key, promise);
      
      const data = await promise;
      setCache(key, data);
    } catch (error) {
      // Silently fail for prefetch - it's not critical
      console.debug(`Prefetch failed for ${key}:`, error);
    } finally {
      pendingRequests.current.delete(key);
    }
  }, [enabled, getFromCache, setCache]);

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
    cache.current.delete(key);
  }, []);

  /**
   * Invalidate all cache entries matching a pattern
   */
  const invalidateCachePattern = useCallback((pattern: string | RegExp) => {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of cache.current.keys()) {
      if (regex.test(key)) {
        cache.current.delete(key);
      }
    }
  }, []);

  /**
   * Clear all cache
   */
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  /**
   * Get cache stats for debugging
   */
  const getCacheStats = useCallback(() => ({
    size: cache.current.size,
    keys: Array.from(cache.current.keys()),
    pending: Array.from(pendingRequests.current.keys()),
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
