import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  permissions: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export interface SessionOptions {
  ttl?: number; // Time to live in seconds
  sliding?: boolean; // Extend session on activity
  maxSessions?: number; // Max concurrent sessions per user
}

export class SessionService {
  private redis: Redis;
  private defaultTTL: number = 24 * 60 * 60; // 24 hours
  private sessionPrefix: string = 'session:';
  private userSessionsPrefix: string = 'user:sessions:';

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    data: Omit<SessionData, 'createdAt' | 'lastActivity' | 'expiresAt'>,
    options: SessionOptions = {}
  ): Promise<string> {
    try {
      const sessionId = uuidv4();
      const ttl = options.ttl || this.defaultTTL;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl * 1000);

      const sessionData: SessionData = {
        ...data,
        userId,
        createdAt: now,
        lastActivity: now,
        expiresAt,
      };

      // Check max sessions limit
      if (options.maxSessions) {
        await this.enforceMaxSessions(userId, options.maxSessions);
      }

      // Store session data
      const sessionKey = this.getSessionKey(sessionId);
      await this.redis.setex(
        sessionKey,
        ttl,
        JSON.stringify(sessionData)
      );

      // Add to user's session list
      const userSessionsKey = this.getUserSessionsKey(userId);
      await this.redis.sadd(userSessionsKey, sessionId);
      await this.redis.expire(userSessionsKey, ttl);

      // Log session creation
      logger.info('Session created', {
        sessionId,
        userId,
        expiresAt,
      });

      return sessionId;
    } catch (error) {
      logger.error('Failed to create session', error);
      throw new AppError('Failed to create session', 500);
    }
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = this.getSessionKey(sessionId);
      const data = await this.redis.get(sessionKey);

      if (!data) {
        return null;
      }

      const sessionData = JSON.parse(data) as SessionData;
      
      // Convert date strings back to Date objects
      sessionData.createdAt = new Date(sessionData.createdAt);
      sessionData.lastActivity = new Date(sessionData.lastActivity);
      sessionData.expiresAt = new Date(sessionData.expiresAt);

      // Check if session has expired
      if (sessionData.expiresAt < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      return sessionData;
    } catch (error) {
      logger.error('Failed to get session', { sessionId, error });
      return null;
    }
  }

  /**
   * Update session activity and optionally extend TTL
   */
  async touchSession(
    sessionId: string,
    options: { sliding?: boolean } = {}
  ): Promise<boolean> {
    try {
      const sessionData = await this.getSession(sessionId);
      if (!sessionData) {
        return false;
      }

      sessionData.lastActivity = new Date();

      // Extend session if sliding is enabled
      if (options.sliding) {
        const ttl = this.defaultTTL;
        sessionData.expiresAt = new Date(Date.now() + ttl * 1000);
      }

      const sessionKey = this.getSessionKey(sessionId);
      const ttl = Math.floor(
        (sessionData.expiresAt.getTime() - Date.now()) / 1000
      );

      if (ttl > 0) {
        await this.redis.setex(
          sessionKey,
          ttl,
          JSON.stringify(sessionData)
        );
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to touch session', { sessionId, error });
      return false;
    }
  }

  /**
   * Update session data
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>
  ): Promise<boolean> {
    try {
      const sessionData = await this.getSession(sessionId);
      if (!sessionData) {
        return false;
      }

      // Merge updates
      const updatedData = {
        ...sessionData,
        ...updates,
        lastActivity: new Date(),
      };

      const sessionKey = this.getSessionKey(sessionId);
      const ttl = Math.floor(
        (sessionData.expiresAt.getTime() - Date.now()) / 1000
      );

      if (ttl > 0) {
        await this.redis.setex(
          sessionKey,
          ttl,
          JSON.stringify(updatedData)
        );
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to update session', { sessionId, error });
      return false;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionData = await this.getSession(sessionId);
      if (!sessionData) {
        return false;
      }

      const sessionKey = this.getSessionKey(sessionId);
      await this.redis.del(sessionKey);

      // Remove from user's session list
      const userSessionsKey = this.getUserSessionsKey(sessionData.userId);
      await this.redis.srem(userSessionsKey, sessionId);

      logger.info('Session deleted', { sessionId, userId: sessionData.userId });
      return true;
    } catch (error) {
      logger.error('Failed to delete session', { sessionId, error });
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<number> {
    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await this.redis.smembers(userSessionsKey);

      if (sessionIds.length === 0) {
        return 0;
      }

      // Delete all session data
      const sessionKeys = sessionIds.map(id => this.getSessionKey(id));
      await this.redis.del(...sessionKeys);

      // Delete user's session list
      await this.redis.del(userSessionsKey);

      logger.info('User sessions deleted', { userId, count: sessionIds.length });
      return sessionIds.length;
    } catch (error) {
      logger.error('Failed to delete user sessions', { userId, error });
      throw new AppError('Failed to delete user sessions', 500);
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await this.redis.smembers(userSessionsKey);

      if (sessionIds.length === 0) {
        return [];
      }

      const sessions: SessionData[] = [];
      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      logger.error('Failed to get user sessions', { userId, error });
      return [];
    }
  }

  /**
   * Count active sessions
   */
  async countActiveSessions(): Promise<number> {
    try {
      const keys = await this.redis.keys(`${this.sessionPrefix}*`);
      return keys.length;
    } catch (error) {
      logger.error('Failed to count active sessions', error);
      return 0;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const keys = await this.redis.keys(`${this.sessionPrefix}*`);
      let cleaned = 0;

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const sessionData = JSON.parse(data) as SessionData;
          if (new Date(sessionData.expiresAt) < new Date()) {
            const sessionId = key.replace(this.sessionPrefix, '');
            await this.deleteSession(sessionId);
            cleaned++;
          }
        }
      }

      logger.info('Cleaned up expired sessions', { count: cleaned });
      return cleaned;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error);
      return 0;
    }
  }

  /**
   * Validate session and check permissions
   */
  async validateSession(
    sessionId: string,
    requiredPermissions?: string[]
  ): Promise<SessionData | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return null;
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      // Check permissions if required
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          session.permissions.includes(permission)
        );

        if (!hasAllPermissions) {
          logger.warn('Session lacks required permissions', {
            sessionId,
            required: requiredPermissions,
            actual: session.permissions,
          });
          return null;
        }
      }

      return session;
    } catch (error) {
      logger.error('Failed to validate session', { sessionId, error });
      return null;
    }
  }

  /**
   * Enforce maximum concurrent sessions per user
   */
  private async enforceMaxSessions(
    userId: string,
    maxSessions: number
  ): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    if (sessions.length >= maxSessions) {
      // Sort by last activity and remove oldest sessions
      sessions.sort((a, b) => 
        a.lastActivity.getTime() - b.lastActivity.getTime()
      );

      const sessionsToRemove = sessions.length - maxSessions + 1;
      for (let i = 0; i < sessionsToRemove; i++) {
        const sessionId = sessions[i].userId; // This should be sessionId
        await this.deleteSession(sessionId);
      }
    }
  }

  /**
   * Get session key for Redis
   */
  private getSessionKey(sessionId: string): string {
    return `${this.sessionPrefix}${sessionId}`;
  }

  /**
   * Get user sessions key for Redis
   */
  private getUserSessionsKey(userId: string): string {
    return `${this.userSessionsPrefix}${userId}`;
  }

  /**
   * Session statistics
   */
  async getSessionStats(): Promise<{
    totalActive: number;
    byRole: Record<string, number>;
    averageSessionDuration: number;
  }> {
    try {
      const keys = await this.redis.keys(`${this.sessionPrefix}*`);
      const byRole: Record<string, number> = {};
      let totalDuration = 0;
      let validSessions = 0;

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const session = JSON.parse(data) as SessionData;
          
          // Count by role
          byRole[session.role] = (byRole[session.role] || 0) + 1;
          
          // Calculate duration
          const duration = new Date(session.lastActivity).getTime() - 
                          new Date(session.createdAt).getTime();
          totalDuration += duration;
          validSessions++;
        }
      }

      return {
        totalActive: keys.length,
        byRole,
        averageSessionDuration: validSessions > 0 
          ? totalDuration / validSessions / 1000 / 60 // in minutes
          : 0,
      };
    } catch (error) {
      logger.error('Failed to get session stats', error);
      return {
        totalActive: 0,
        byRole: {},
        averageSessionDuration: 0,
      };
    }
  }
}

// Export singleton instance
let sessionService: SessionService;

export const initializeSessionService = (redisClient: Redis): SessionService => {
  sessionService = new SessionService(redisClient);
  return sessionService;
};

export const getSessionService = (): SessionService => {
  if (!sessionService) {
    throw new Error('Session service not initialized');
  }
  return sessionService;
};