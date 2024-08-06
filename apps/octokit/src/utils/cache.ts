interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();

  set(key: string, value: T, ttl: number): void {
    const expiresAt = Date.now() + ttl;
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  isExpired(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return true;
    return Date.now() > entry.expiresAt;
  }
}

export const tokenCache = new Cache<string>();
