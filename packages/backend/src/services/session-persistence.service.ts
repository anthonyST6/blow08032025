import { firestore, getServerTimestamp } from '../config/firebase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';

export interface MissionControlSession {
  id: string;
  userId: string;
  sessionId: string;
  selectedVertical: string | null;
  selectedUseCase: string | null;
  selectedUseCaseDetails?: any;
  uploadedData: any | null;
  executionHistory: ExecutionRecord[];
  currentStep: string | null;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    deviceId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface ExecutionRecord {
  id: string;
  useCaseId: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: any;
}

export interface SessionQuery {
  userId?: string;
  sessionId?: string;
  isActive?: boolean;
  includeExpired?: boolean;
}

export class SessionPersistenceService {
  private static instance: SessionPersistenceService;
  private db: FirebaseFirestore.Firestore;
  private redis: Redis | null = null;
  private readonly COLLECTION_NAME = 'missionControlSessions';
  private readonly REDIS_PREFIX = 'mc:session:';
  private readonly SESSION_TTL_HOURS = 24;
  private readonly CACHE_TTL_SECONDS = 3600; // 1 hour

  private constructor() {
    this.db = firestore();
    this.initializeRedis();
    this.startCleanupJob();
  }

  static getInstance(): SessionPersistenceService {
    if (!SessionPersistenceService.instance) {
      SessionPersistenceService.instance = new SessionPersistenceService();
    }
    return SessionPersistenceService.instance;
  }

  /**
   * Initialize Redis connection for caching
   */
  private async initializeRedis(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        this.redis.on('connect', () => {
          logger.info('Redis connected for session caching');
        });
        this.redis.on('error', (error) => {
          logger.error('Redis connection error:', error);
        });
      }
    } catch (error) {
      logger.warn('Redis initialization failed, falling back to Firestore only', error);
    }
  }

  /**
   * Save or update a session
   */
  async saveSession(
    userId: string,
    sessionData: Partial<MissionControlSession>,
    metadata?: MissionControlSession['metadata']
  ): Promise<MissionControlSession> {
    try {
      const sessionId = sessionData.sessionId || uuidv4();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.SESSION_TTL_HOURS * 60 * 60 * 1000);

      // Check if session exists
      const existingSession = await this.getSession(userId, sessionId);

      const session: MissionControlSession = {
        id: existingSession?.id || uuidv4(),
        userId,
        sessionId,
        selectedVertical: sessionData.selectedVertical || null,
        selectedUseCase: sessionData.selectedUseCase || null,
        selectedUseCaseDetails: sessionData.selectedUseCaseDetails,
        uploadedData: sessionData.uploadedData || null,
        executionHistory: sessionData.executionHistory || existingSession?.executionHistory || [],
        currentStep: sessionData.currentStep || null,
        metadata: metadata || existingSession?.metadata || {},
        createdAt: existingSession?.createdAt || now,
        updatedAt: now,
        expiresAt: sessionData.expiresAt || expiresAt,
        isActive: true
      };

      // Save to Firestore
      await this.db
        .collection(this.COLLECTION_NAME)
        .doc(session.id)
        .set({
          ...session,
          createdAt: existingSession ? session.createdAt : getServerTimestamp(),
          updatedAt: getServerTimestamp(),
        });

      // Cache in Redis if available
      if (this.redis) {
        const cacheKey = `${this.REDIS_PREFIX}${userId}:${sessionId}`;
        await this.redis.setex(
          cacheKey,
          this.CACHE_TTL_SECONDS,
          JSON.stringify(session)
        );
      }

      logger.info('Session saved successfully', {
        sessionId: session.sessionId,
        userId,
        hasUseCase: !!session.selectedUseCase
      });

      return session;
    } catch (error) {
      logger.error('Failed to save session', { error, userId });
      throw error;
    }
  }

  /**
   * Get a specific session
   */
  async getSession(userId: string, sessionId: string): Promise<MissionControlSession | null> {
    try {
      // Check Redis cache first
      if (this.redis) {
        const cacheKey = `${this.REDIS_PREFIX}${userId}:${sessionId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Query Firestore
      const snapshot = await this.db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .where('sessionId', '==', sessionId)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const session = {
        id: doc.id,
        ...doc.data()
      } as MissionControlSession;

      // Check if expired
      if (new Date(session.expiresAt) < new Date()) {
        await this.expireSession(session.id);
        return null;
      }

      // Cache in Redis
      if (this.redis) {
        const cacheKey = `${this.REDIS_PREFIX}${userId}:${sessionId}`;
        await this.redis.setex(
          cacheKey,
          this.CACHE_TTL_SECONDS,
          JSON.stringify(session)
        );
      }

      return session;
    } catch (error) {
      logger.error('Failed to get session', { error, userId, sessionId });
      return null;
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(
    userId: string,
    options: { includeExpired?: boolean; limit?: number } = {}
  ): Promise<MissionControlSession[]> {
    try {
      let query = this.db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId);

      if (!options.includeExpired) {
        query = query.where('isActive', '==', true);
      }

      query = query.orderBy('updatedAt', 'desc');

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      const sessions: MissionControlSession[] = [];

      for (const doc of snapshot.docs) {
        const session = {
          id: doc.id,
          ...doc.data()
        } as MissionControlSession;

        // Filter out expired sessions unless requested
        if (!options.includeExpired && new Date(session.expiresAt) < new Date()) {
          continue;
        }

        sessions.push(session);
      }

      return sessions;
    } catch (error) {
      logger.error('Failed to get user sessions', { error, userId });
      return [];
    }
  }

  /**
   * Clear a specific session
   */
  async clearSession(userId: string, sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(userId, sessionId);
      if (!session) {
        return false;
      }

      // Mark as inactive
      await this.db
        .collection(this.COLLECTION_NAME)
        .doc(session.id)
        .update({
          isActive: false,
          updatedAt: getServerTimestamp()
        });

      // Remove from Redis cache
      if (this.redis) {
        const cacheKey = `${this.REDIS_PREFIX}${userId}:${sessionId}`;
        await this.redis.del(cacheKey);
      }

      logger.info('Session cleared', { sessionId, userId });
      return true;
    } catch (error) {
      logger.error('Failed to clear session', { error, userId, sessionId });
      return false;
    }
  }

  /**
   * Clear all sessions for a user
   */
  async clearUserSessions(userId: string): Promise<number> {
    try {
      const sessions = await this.getUserSessions(userId);
      let clearedCount = 0;

      for (const session of sessions) {
        const cleared = await this.clearSession(userId, session.sessionId);
        if (cleared) clearedCount++;
      }

      logger.info('User sessions cleared', { userId, count: clearedCount });
      return clearedCount;
    } catch (error) {
      logger.error('Failed to clear user sessions', { error, userId });
      return 0;
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(userId: string, sessionId: string, hours?: number): Promise<boolean> {
    try {
      const session = await this.getSession(userId, sessionId);
      if (!session) {
        return false;
      }

      const extensionHours = hours || this.SESSION_TTL_HOURS;
      const newExpiresAt = new Date(Date.now() + extensionHours * 60 * 60 * 1000);

      await this.db
        .collection(this.COLLECTION_NAME)
        .doc(session.id)
        .update({
          expiresAt: newExpiresAt,
          updatedAt: getServerTimestamp()
        });

      // Update Redis cache
      if (this.redis) {
        const cacheKey = `${this.REDIS_PREFIX}${userId}:${sessionId}`;
        session.expiresAt = newExpiresAt;
        await this.redis.setex(
          cacheKey,
          this.CACHE_TTL_SECONDS,
          JSON.stringify(session)
        );
      }

      logger.info('Session extended', { sessionId, userId, newExpiresAt });
      return true;
    } catch (error) {
      logger.error('Failed to extend session', { error, userId, sessionId });
      return false;
    }
  }

  /**
   * Add execution record to session
   */
  async addExecutionRecord(
    userId: string,
    sessionId: string,
    execution: ExecutionRecord
  ): Promise<boolean> {
    try {
      const session = await this.getSession(userId, sessionId);
      if (!session) {
        return false;
      }

      // Add to execution history
      const updatedHistory = [...session.executionHistory, execution];
      
      // Keep only last 100 executions
      if (updatedHistory.length > 100) {
        updatedHistory.splice(0, updatedHistory.length - 100);
      }

      await this.saveSession(userId, {
        ...session,
        executionHistory: updatedHistory
      });

      return true;
    } catch (error) {
      logger.error('Failed to add execution record', { error, userId, sessionId });
      return false;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(userId?: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    averageSessionDuration: number;
    mostUsedVertical: string | null;
    mostUsedUseCase: string | null;
  }> {
    try {
      let query = this.db.collection(this.COLLECTION_NAME);
      
      if (userId) {
        query = query.where('userId', '==', userId) as any;
      }

      const snapshot = await query.get();
      
      let totalSessions = 0;
      let activeSessions = 0;
      let expiredSessions = 0;
      let totalDuration = 0;
      const verticalCounts: Record<string, number> = {};
      const useCaseCounts: Record<string, number> = {};

      const now = new Date();

      snapshot.forEach(doc => {
        const session = doc.data() as MissionControlSession;
        totalSessions++;

        if (session.isActive && new Date(session.expiresAt) > now) {
          activeSessions++;
        } else {
          expiredSessions++;
        }

        // Calculate duration
        const duration = new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime();
        totalDuration += duration;

        // Count verticals and use cases
        if (session.selectedVertical) {
          verticalCounts[session.selectedVertical] = (verticalCounts[session.selectedVertical] || 0) + 1;
        }
        if (session.selectedUseCase) {
          useCaseCounts[session.selectedUseCase] = (useCaseCounts[session.selectedUseCase] || 0) + 1;
        }
      });

      // Find most used
      const mostUsedVertical = Object.entries(verticalCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
      
      const mostUsedUseCase = Object.entries(useCaseCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

      return {
        totalSessions,
        activeSessions,
        expiredSessions,
        averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
        mostUsedVertical,
        mostUsedUseCase
      };
    } catch (error) {
      logger.error('Failed to get session stats', { error });
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        averageSessionDuration: 0,
        mostUsedVertical: null,
        mostUsedUseCase: null
      };
    }
  }

  /**
   * Expire a session
   */
  private async expireSession(sessionId: string): Promise<void> {
    await this.db
      .collection(this.COLLECTION_NAME)
      .doc(sessionId)
      .update({
        isActive: false,
        updatedAt: getServerTimestamp()
      });
  }

  /**
   * Start cleanup job for expired sessions
   */
  private startCleanupJob(): void {
    // Run cleanup every hour
    setInterval(async () => {
      try {
        const now = new Date();
        const snapshot = await this.db
          .collection(this.COLLECTION_NAME)
          .where('isActive', '==', true)
          .where('expiresAt', '<', now)
          .get();

        let expiredCount = 0;
        const batch = this.db.batch();

        snapshot.forEach(doc => {
          batch.update(doc.ref, {
            isActive: false,
            updatedAt: getServerTimestamp()
          });
          expiredCount++;
        });

        if (expiredCount > 0) {
          await batch.commit();
          logger.info(`Expired ${expiredCount} sessions`);
        }
      } catch (error) {
        logger.error('Session cleanup job failed', { error });
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      firestore: boolean;
      redis: boolean;
      lastCleanup?: Date;
    };
  }> {
    const details = {
      firestore: false,
      redis: false
    };

    try {
      // Check Firestore
      await this.db.collection(this.COLLECTION_NAME).limit(1).get();
      details.firestore = true;
    } catch (error) {
      logger.error('Firestore health check failed', { error });
    }

    try {
      // Check Redis
      if (this.redis) {
        await this.redis.ping();
        details.redis = true;
      }
    } catch (error) {
      logger.error('Redis health check failed', { error });
    }

    const status = details.firestore 
      ? (details.redis || !this.redis ? 'healthy' : 'degraded')
      : 'unhealthy';

    return { status, details };
  }
}

// Export singleton instance
export const sessionPersistenceService = SessionPersistenceService.getInstance();