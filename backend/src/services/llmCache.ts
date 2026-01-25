/**
 * LLM 响应缓存服务
 * 使用内存缓存减少重复请求，节省成本
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

class LLMCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = 3600000; // 1小时（毫秒）

  /**
   * 生成缓存键
   */
  generateKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params).sort().map(key => `${key}:${params[key]}`);
    return `${type}:${sortedParams.join('|')}`;
  }

  /**
   * 获取缓存
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 设置缓存
   */
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const llmCache = new LLMCache();
