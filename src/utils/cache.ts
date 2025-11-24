import redisClient from "@/config/redis";

/**
 * 缓存工具类
 */
export class CacheService {
  private readonly defaultTTL = 600; // 默认缓存时间 10 分钟

  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  /**
   * 设置缓存
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.set(key, serializedValue, { EX: ttl });
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      // 缓存失败不影响主流程
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cachedValue = await redisClient.get(key);
      if (cachedValue && typeof cachedValue === "string") {
        return JSON.parse(cachedValue) as T;
      }
      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * 删除匹配模式的缓存
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Cache delete by pattern error for ${pattern}:`, error);
    }
  }
}

// 缓存键前缀常量
export const CACHE_KEYS = {
  SCHEDULE_LIST: "schedule:list",
  USER_INFO: "user:info",
} as const;

// 创建缓存服务实例
export const cacheService = new CacheService();
