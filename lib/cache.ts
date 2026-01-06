/**
 * Simple in-memory TTL cache for API responses
 * Used to cache market data and reduce API calls
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class TTLCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private defaultTTL: number

  constructor(defaultTTL: number = 30000) {
    // Default TTL: 30 seconds
    this.defaultTTL = defaultTTL
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      // Entry expired, remove it
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set data in cache with TTL
   */
  set(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { data, expiresAt })
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

// Global cache instances
export const marketsCache = new TTLCache<any>(600000) // 10 minutes
export const arbitrageCache = new TTLCache<any>(600000) // 10 minutes

