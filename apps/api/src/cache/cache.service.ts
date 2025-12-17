import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: string;
}

/**
 * Simple in-memory cache service with TTL and pattern-based invalidation
 * 
 * Features:
 * - TTL (Time To Live) per entry
 * - Pattern-based invalidation (e.g., "dashboard:tenant123:*")
 * - Tenant isolation via key prefixing
 * - Automatic cleanup of expired entries
 * - Cache stats for monitoring
 * 
 * @example
 * // Store with 60 second TTL
 * cache.set('dashboard:tenant1:stats', stats, 60);
 * 
 * // Get (returns null if expired or missing)
 * const stats = cache.get<DashboardStats>('dashboard:tenant1:stats');
 * 
 * // Invalidate by pattern
 * cache.invalidatePattern('dashboard:tenant1:*');
 * 
 * // Invalidate all for a tenant
 * cache.invalidateTenant('tenant1');
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;
  
  // Cleanup expired entries every 5 minutes
  private readonly cleanupInterval = setInterval(() => {
    this.cleanup();
  }, 5 * 60 * 1000);

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return entry.data as T;
  }

  /**
   * Store a value in cache with TTL
   * @param key Cache key (use format: "entity:tenantId:identifier")
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds (default: 60)
   */
  set<T>(key: string, data: T, ttlSeconds = 60): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern
   * Supports wildcards: "*" matches any characters
   * 
   * @example
   * cache.invalidatePattern('dashboard:tenant1:*'); // All dashboard cache for tenant1
   * cache.invalidatePattern('owners:*'); // All owners cache
   */
  invalidatePattern(pattern: string): number {
    const regex = this.patternToRegex(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.logger.debug(`Invalidated ${count} cache entries matching "${pattern}"`);
    }
    
    return count;
  }

  /**
   * Invalidate all cache entries for a specific tenant
   */
  invalidateTenant(tenantId: string): number {
    return this.invalidatePattern(`*:${tenantId}:*`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cleared all ${size} cache entries`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : '0%',
    };
  }

  /**
   * Get or compute: returns cached value or computes and caches it
   * This is the recommended method for most use cases
   * 
   * @example
   * const stats = await cache.getOrCompute(
   *   'dashboard:tenant1:stats',
   *   async () => this.computeStats(),
   *   60 // TTL in seconds
   * );
   */
  async getOrCompute<T>(
    key: string,
    compute: () => Promise<T>,
    ttlSeconds = 60,
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Compute and cache
    const data = await compute();
    this.set(key, data, ttlSeconds);
    
    return data;
  }

  /**
   * Build a cache key with tenant isolation
   */
  static buildKey(entity: string, tenantId: string, ...parts: (string | number)[]): string {
    return [entity, tenantId, ...parts].join(':');
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Convert a pattern with wildcards to a regex
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*/g, '.*'); // Convert * to .*
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}
