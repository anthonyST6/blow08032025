/**
 * Generic Persistence Service
 * Provides a unified interface for storing and retrieving data
 * across different storage mechanisms (localStorage, sessionStorage)
 */

export interface PersistenceOptions {
  storage?: 'local' | 'session';
  ttl?: number; // Time to live in milliseconds
  encrypt?: boolean;
}

interface StoredItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

class PersistenceService {
  private static instance: PersistenceService;
  
  private constructor() {}
  
  static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }
  
  /**
   * Store data with optional TTL
   */
  set<T>(key: string, value: T, options: PersistenceOptions = {}): void {
    const { storage = 'local', ttl } = options;
    
    try {
      const item: StoredItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl
      };
      
      const serialized = JSON.stringify(item);
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      
      storageObj.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to store item ${key}:`, error);
    }
  }
  
  /**
   * Retrieve data, checking TTL if applicable
   */
  get<T>(key: string, options: PersistenceOptions = {}): T | null {
    const { storage = 'local' } = options;
    
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      const serialized = storageObj.getItem(key);
      
      if (!serialized) return null;
      
      const item: StoredItem<T> = JSON.parse(serialized);
      
      // Check TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key, options);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error(`Failed to retrieve item ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Remove an item from storage
   */
  remove(key: string, options: PersistenceOptions = {}): void {
    const { storage = 'local' } = options;
    
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      storageObj.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }
  
  /**
   * Clear all items or items matching a pattern
   */
  clear(pattern?: RegExp, options: PersistenceOptions = {}): void {
    const { storage = 'local' } = options;
    
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      
      if (!pattern) {
        storageObj.clear();
        return;
      }
      
      // Clear items matching pattern
      const keys = Object.keys(storageObj);
      keys.forEach(key => {
        if (pattern.test(key)) {
          storageObj.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
  
  /**
   * Check if a key exists
   */
  has(key: string, options: PersistenceOptions = {}): boolean {
    const { storage = 'local' } = options;
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    return storageObj.getItem(key) !== null;
  }
  
  /**
   * Get all keys matching a pattern
   */
  keys(pattern?: RegExp, options: PersistenceOptions = {}): string[] {
    const { storage = 'local' } = options;
    
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      const allKeys = Object.keys(storageObj);
      
      if (!pattern) return allKeys;
      
      return allKeys.filter(key => pattern.test(key));
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }
  
  /**
   * Get storage size in bytes
   */
  getSize(options: PersistenceOptions = {}): number {
    const { storage = 'local' } = options;
    
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      let size = 0;
      
      for (const key in storageObj) {
        if (storageObj.hasOwnProperty(key)) {
          size += storageObj[key].length + key.length;
        }
      }
      
      return size;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }
  
  /**
   * Export all data
   */
  export(options: PersistenceOptions = {}): Record<string, any> {
    const { storage = 'local' } = options;
    
    try {
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      const data: Record<string, any> = {};
      
      for (const key in storageObj) {
        if (storageObj.hasOwnProperty(key)) {
          try {
            const item = JSON.parse(storageObj[key]);
            data[key] = item.data;
          } catch {
            // If not our format, store raw value
            data[key] = storageObj[key];
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to export data:', error);
      return {};
    }
  }
  
  /**
   * Import data
   */
  import(data: Record<string, any>, options: PersistenceOptions = {}): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, options);
    });
  }
}

export const persistenceService = PersistenceService.getInstance();