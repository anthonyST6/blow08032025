import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis configuration for caching
export const redisCache = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_CACHE_DB || '0'),
  keyPrefix: 'cache:',
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis cache connection retry attempt ${times}, delay: ${delay}ms`);
    return delay;
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },
});

// Redis configuration for Bull MQ (job queues)
export const redisBullMQ = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_QUEUE_DB || '1'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis BullMQ connection retry attempt ${times}, delay: ${delay}ms`);
    return delay;
  },
});

// Redis configuration for session storage
export const redisSession = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_SESSION_DB || '2'),
  keyPrefix: 'session:',
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis session connection retry attempt ${times}, delay: ${delay}ms`);
    return delay;
  },
});

// Handle Redis connection events
redisCache.on('connect', () => {
  logger.info('Redis cache connected');
});

redisCache.on('error', (err) => {
  logger.error('Redis cache error:', err);
});

redisBullMQ.on('connect', () => {
  logger.info('Redis BullMQ connected');
});

redisBullMQ.on('error', (err) => {
  logger.error('Redis BullMQ error:', err);
});

redisSession.on('connect', () => {
  logger.info('Redis session connected');
});

redisSession.on('error', (err) => {
  logger.error('Redis session error:', err);
});

// Cache helper functions
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redisCache.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    logger.error('Cache get error:', { key, error });
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redisCache.setex(key, ttlSeconds, serialized);
    } else {
      await redisCache.set(key, serialized);
    }
  } catch (error) {
    logger.error('Cache set error:', { key, error });
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await redisCache.del(key);
  } catch (error) {
    logger.error('Cache delete error:', { key, error });
  }
}

export async function clearCache(pattern: string = '*'): Promise<void> {
  try {
    const keys = await redisCache.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisCache.del(...keys);
      logger.info(`Cleared ${keys.length} cache entries`);
    }
  } catch (error) {
    logger.error('Cache clear error:', { pattern, error });
  }
}

// Session helper functions
export async function getSession(sessionId: string): Promise<any | null> {
  try {
    const session = await redisSession.get(sessionId);
    if (session) {
      return JSON.parse(session);
    }
    return null;
  } catch (error) {
    logger.error('Session get error:', { sessionId, error });
    return null;
  }
}

export async function setSession(
  sessionId: string,
  data: any,
  ttlSeconds: number = 3600 // Default 1 hour
): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    await redisSession.setex(sessionId, ttlSeconds, serialized);
  } catch (error) {
    logger.error('Session set error:', { sessionId, error });
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await redisSession.del(sessionId);
  } catch (error) {
    logger.error('Session delete error:', { sessionId, error });
  }
}

// Graceful shutdown
export async function closeRedisConnections(): Promise<void> {
  try {
    await Promise.all([
      redisCache.quit(),
      redisBullMQ.quit(),
      redisSession.quit(),
    ]);
    logger.info('All Redis connections closed');
  } catch (error) {
    logger.error('Error closing Redis connections:', error);
  }
}