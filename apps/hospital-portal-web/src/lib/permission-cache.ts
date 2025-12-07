import { useAuthStore } from '@/lib/auth-store';

interface PermissionCacheEntry {
  permissions: string[];
  roles: string[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface PermissionCacheOptions {
  ttl?: number; // Default 5 minutes
  storageKey?: string;
}

class PermissionCache {
  private cache: Map<string, PermissionCacheEntry> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly storageKey = 'permission_cache';

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  /**
   * Get cached permissions for a user
   */
  get(userId: string): PermissionCacheEntry | null {
    const entry = this.cache.get(userId);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(userId);
      this.saveToStorage();
      return null;
    }

    return entry;
  }

  /**
   * Set permissions in cache
   */
  set(userId: string, permissions: string[], roles: string[], options: PermissionCacheOptions = {}): void {
    const entry: PermissionCacheEntry = {
      permissions: [...permissions],
      roles: [...roles],
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL
    };

    this.cache.set(userId, entry);
    this.saveToStorage();
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
    this.saveToStorage();
  }

  /**
   * Clear all cached permissions
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * Check if user has permission (with caching)
   */
  hasPermission(userId: string, permissionCode: string): boolean | null {
    const entry = this.get(userId);
    if (!entry) return null; // Cache miss

    // Handle wildcard permission
    if (entry.permissions.includes('*')) return true;

    return entry.permissions.includes(permissionCode);
  }

  /**
   * Check if user has role (with caching)
   */
  hasRole(userId: string, roleName: string): boolean | null {
    const entry = this.get(userId);
    if (!entry) return null; // Cache miss

    return entry.roles.includes(roleName);
  }

  /**
   * Get all permissions for user (with caching)
   */
  getPermissions(userId: string): string[] | null {
    const entry = this.get(userId);
    return entry ? [...entry.permissions] : null;
  }

  /**
   * Get all roles for user (with caching)
   */
  getRoles(userId: string): string[] | null {
    const entry = this.get(userId);
    return entry ? [...entry.roles] : null;
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem(this.storageKey, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save permission cache to storage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const cacheObject = JSON.parse(stored);
        this.cache = new Map(Object.entries(cacheObject));
      }
    } catch (error) {
      console.warn('Failed to load permission cache from storage:', error);
      this.cache.clear();
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    if (typeof window === 'undefined') return;

    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      let hasChanges = false;

      for (const [userId, entry] of this.cache.entries()) {
        if (now > entry.timestamp + entry.ttl) {
          this.cache.delete(userId);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        this.saveToStorage();
      }
    }, 60 * 1000); // Every minute
  }
}

// Create singleton instance
const permissionCache = new PermissionCache();

/**
 * Enhanced auth store with caching
 */
export function useCachedAuthStore() {
  const store = useAuthStore();

  return {
    ...store,

    // Cached permission checks
    hasPermission: (permissionCode: string): boolean => {
      const user = store.user;
      if (!user) return false;

      // Try cache first
      const cached = permissionCache.hasPermission(user.id, permissionCode);
      if (cached !== null) return cached;

      // Fall back to store
      return store.hasPermission(permissionCode);
    },

    hasRole: (roleName: string): boolean => {
      const user = store.user;
      if (!user) return false;

      // Try cache first
      const cached = permissionCache.hasRole(user.id, roleName);
      if (cached !== null) return cached;

      // Fall back to store
      return store.hasRole(roleName);
    },

    getPermissions: (): string[] => {
      const user = store.user;
      if (!user) return [];

      // Try cache first
      const cached = permissionCache.getPermissions(user.id);
      if (cached !== null) return cached;

      // Fall back to store
      return store.permissions || [];
    },

    getRoles: (): string[] => {
      const user = store.user;
      if (!user) return [];

      // Try cache first
      const cached = permissionCache.getRoles(user.id);
      if (cached !== null) return cached;

      // Fall back to store
      return store.roles || [];
    },

    // Enhanced setAuth with caching
    setAuth: (
      token: string,
      refreshToken: string | null,
      user: any,
      roles: string[],
      permissions: string[],
      tenantId: string | null,
      mustChangePassword: boolean
    ) => {
      // Update store
      store.setAuth(token, refreshToken, user, roles, permissions, tenantId, mustChangePassword);

      // Cache permissions
      permissionCache.set(user.id, permissions, roles);
    },

    // Enhanced logout with cache clearing
    logout: () => {
      const user = store.user;
      if (user) {
        permissionCache.invalidate(user.id);
      }
      store.logout();
    }
  };
}

/**
 * Hook for permission caching utilities
 */
export function usePermissionCache() {
  const user = useAuthStore().user;

  return {
    // Cache management
    invalidateCache: () => {
      if (user) permissionCache.invalidate(user.id);
    },

    clearAllCache: () => permissionCache.clear(),

    // Cache statistics
    getCacheSize: () => permissionCache['cache'].size,

    // Check if permission is cached
    isCached: (permissionCode: string): boolean => {
      if (!user) return false;
      return permissionCache.hasPermission(user.id, permissionCode) !== null;
    }
  };
}

export { permissionCache };
export type { PermissionCacheOptions };