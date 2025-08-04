import { api } from './api';
import { AxiosRequestConfig } from 'axios';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiWithCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
  private defaultTimeout = 1000; // 1 second

  /**
   * Make an API request with caching and timeout
   */
  async request<T>(
    config: AxiosRequestConfig & {
      cacheKey?: string;
      cacheDuration?: number;
      timeout?: number;
      fallbackData?: T;
    }
  ): Promise<T> {
    const {
      cacheKey,
      cacheDuration = this.defaultCacheDuration,
      timeout = this.defaultTimeout,
      fallbackData,
      ...axiosConfig
    } = config;

    // Generate cache key if not provided
    const key = cacheKey || this.generateCacheKey(axiosConfig);

    // Check cache first
    const cached = this.getFromCache<T>(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Create timeout promise
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });

    // Make the actual request
    const requestPromise = api.request<T>(axiosConfig)
      .then(response => {
        const data = response.data;
        // Cache the successful response
        this.setCache(key, data, cacheDuration);
        return data;
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(key);
      });

    // Store as pending request
    this.pendingRequests.set(key, requestPromise);

    try {
      // Race between request and timeout
      const result = await Promise.race([requestPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.warn(`API request failed or timed out: ${axiosConfig.url}`, error);
      
      // If we have fallback data, return it
      if (fallbackData !== undefined) {
        // Cache the fallback data for a shorter duration
        this.setCache(key, fallbackData, 60000); // 1 minute
        return fallbackData;
      }
      
      throw error;
    }
  }

  /**
   * GET request with caching
   */
  async get<T>(
    url: string,
    options?: {
      params?: any;
      cacheKey?: string;
      cacheDuration?: number;
      timeout?: number;
      fallbackData?: T;
    }
  ): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params: options?.params,
      ...options,
    });
  }

  /**
   * POST request (typically not cached)
   */
  async post<T>(
    url: string,
    data?: any,
    options?: {
      timeout?: number;
      fallbackData?: T;
    }
  ): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...options,
    });
  }

  /**
   * PUT request (typically not cached)
   */
  async put<T>(
    url: string,
    data?: any,
    options?: {
      timeout?: number;
      fallbackData?: T;
    }
  ): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...options,
    });
  }

  /**
   * DELETE request (typically not cached)
   */
  async delete<T>(
    url: string,
    options?: {
      timeout?: number;
      fallbackData?: T;
    }
  ): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...options,
    });
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache
   */
  private setCache<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  /**
   * Generate cache key from request config
   */
  private generateCacheKey(config: AxiosRequestConfig): string {
    const { method = 'GET', url, params } = config;
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiWithCache = new ApiWithCacheService();