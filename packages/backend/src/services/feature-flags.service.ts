import { firestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { Timestamp } from 'firebase-admin/firestore';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  targetGroups?: string[]; // User groups or roles
  environments: string[]; // ['development', 'staging', 'production']
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface FeatureFlagEvaluation {
  enabled: boolean;
  variant?: string;
  reason: string;
}

class FeatureFlagsService {
  private collection = 'featureFlags';
  private db = firestore();
  private cache: Map<string, FeatureFlag> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  async createFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
    try {
      const newFlag: FeatureFlag = {
        ...flag,
        id: this.db.collection(this.collection).doc().id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(newFlag.id).set(newFlag);
      this.cache.set(newFlag.id, newFlag);
      
      logger.info('Feature flag created', { flagId: newFlag.id, name: newFlag.name });
      return newFlag;
    } catch (error) {
      logger.error('Failed to create feature flag', error);
      throw error;
    }
  }

  async updateFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    try {
      const flagRef = this.db.collection(this.collection).doc(id);
      const doc = await flagRef.get();
      
      if (!doc.exists) {
        throw new Error('Feature flag not found');
      }

      const updatedFlag = {
        ...doc.data(),
        ...updates,
        id,
        updatedAt: new Date(),
      } as FeatureFlag;

      await flagRef.update({
        ...updates,
        updatedAt: new Date(),
      });
      this.cache.set(id, updatedFlag);
      
      logger.info('Feature flag updated', { flagId: id });
      return updatedFlag;
    } catch (error) {
      logger.error('Failed to update feature flag', error);
      throw error;
    }
  }

  async getFlag(id: string): Promise<FeatureFlag | null> {
    try {
      // Check cache first
      if (this.cache.has(id) && !this.isCacheExpired()) {
        return this.cache.get(id)!;
      }

      const doc = await this.db.collection(this.collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const flag = { id: doc.id, ...doc.data() } as FeatureFlag;
      this.cache.set(id, flag);
      
      return flag;
    } catch (error) {
      logger.error('Failed to get feature flag', error);
      throw error;
    }
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    try {
      // Check if cache is still valid
      if (!this.isCacheExpired() && this.cache.size > 0) {
        return Array.from(this.cache.values());
      }

      const snapshot = await this.db.collection(this.collection).get();
      const flags: FeatureFlag[] = [];

      snapshot.forEach((doc: any) => {
        const flag = { id: doc.id, ...doc.data() } as FeatureFlag;
        flags.push(flag);
        this.cache.set(flag.id, flag);
      });

      this.lastCacheUpdate = Date.now();
      return flags;
    } catch (error) {
      logger.error('Failed to get all feature flags', error);
      throw error;
    }
  }

  async evaluateFlag(
    flagName: string,
    userId: string,
    userAttributes?: Record<string, any>
  ): Promise<FeatureFlagEvaluation> {
    try {
      const flags = await this.getAllFlags();
      const flag = flags.find(f => f.name === flagName);

      if (!flag) {
        return {
          enabled: false,
          reason: 'Flag not found',
        };
      }

      // Check if flag is globally disabled
      if (!flag.enabled) {
        return {
          enabled: false,
          reason: 'Flag is disabled',
        };
      }

      // Check environment
      const currentEnv = process.env.NODE_ENV || 'development';
      if (!flag.environments.includes(currentEnv)) {
        return {
          enabled: false,
          reason: `Flag not enabled for environment: ${currentEnv}`,
        };
      }

      // Check target groups
      if (flag.targetGroups && flag.targetGroups.length > 0) {
        const userGroups = userAttributes?.groups || [];
        const hasTargetGroup = flag.targetGroups.some(group => userGroups.includes(group));
        
        if (!hasTargetGroup) {
          return {
            enabled: false,
            reason: 'User not in target group',
          };
        }
      }

      // Check rollout percentage
      if (flag.rolloutPercentage < 100) {
        const userHash = this.hashUserId(userId);
        const userPercentage = (userHash % 100) + 1;
        
        if (userPercentage > flag.rolloutPercentage) {
          return {
            enabled: false,
            reason: `User not in rollout percentage (${flag.rolloutPercentage}%)`,
          };
        }
      }

      return {
        enabled: true,
        reason: 'Flag is enabled for user',
      };
    } catch (error) {
      logger.error('Failed to evaluate feature flag', error);
      return {
        enabled: false,
        reason: 'Error evaluating flag',
      };
    }
  }

  async deleteFlag(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
      this.cache.delete(id);
      
      logger.info('Feature flag deleted', { flagId: id });
    } catch (error) {
      logger.error('Failed to delete feature flag', error);
      throw error;
    }
  }

  // V2 Feature Flags
  async getV2FeatureFlags(): Promise<Record<string, boolean>> {
    const flags = await this.getAllFlags();
    const v2Flags: Record<string, boolean> = {
      missionControlV2: false,
      useCaseDashboardV2: false,
      certificationsDashboardV2: false,
      vanguardAgents: false,
      autoFixCertifications: false,
      closedLoopOrchestration: false,
      humanInTheLoop: false,
      multiChannelNotifications: false,
    };

    // Map feature flags to V2 features
    flags.forEach(flag => {
      if (flag.enabled && flag.environments.includes(process.env.NODE_ENV || 'development')) {
        switch (flag.name) {
          case 'mission-control-v2':
            v2Flags.missionControlV2 = true;
            break;
          case 'use-case-dashboard-v2':
            v2Flags.useCaseDashboardV2 = true;
            break;
          case 'certifications-dashboard-v2':
            v2Flags.certificationsDashboardV2 = true;
            break;
          case 'vanguard-agents':
            v2Flags.vanguardAgents = true;
            break;
          case 'auto-fix-certifications':
            v2Flags.autoFixCertifications = true;
            break;
          case 'closed-loop-orchestration':
            v2Flags.closedLoopOrchestration = true;
            break;
          case 'human-in-the-loop':
            v2Flags.humanInTheLoop = true;
            break;
          case 'multi-channel-notifications':
            v2Flags.multiChannelNotifications = true;
            break;
        }
      }
    });

    return v2Flags;
  }

  private isCacheExpired(): boolean {
    return Date.now() - this.lastCacheUpdate > this.cacheExpiry;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Initialize default V2 feature flags
  async initializeV2Flags(): Promise<void> {
    const v2Flags = [
      {
        name: 'mission-control-v2',
        description: 'Enable Mission Control Dashboard v2 with agent canvas and workflow visualization',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development', 'staging'],
        createdBy: 'system',
      },
      {
        name: 'use-case-dashboard-v2',
        description: 'Enable Use Case Dashboard v2 with lease grid and GIS integration',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development', 'staging'],
        createdBy: 'system',
      },
      {
        name: 'certifications-dashboard-v2',
        description: 'Enable Certifications Dashboard v2 with auto-fix tracking',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development', 'staging'],
        createdBy: 'system',
      },
      {
        name: 'vanguard-agents',
        description: 'Enable Vanguard AI agents (Security, Integrity, Accuracy, Optimization, Negotiation)',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development'],
        createdBy: 'system',
      },
      {
        name: 'auto-fix-certifications',
        description: 'Enable automated certification issue fixes',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development'],
        createdBy: 'system',
      },
      {
        name: 'closed-loop-orchestration',
        description: 'Enable closed-loop orchestration workflows',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development'],
        createdBy: 'system',
      },
      {
        name: 'human-in-the-loop',
        description: 'Enable human-in-the-loop approval system',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development', 'staging'],
        createdBy: 'system',
      },
      {
        name: 'multi-channel-notifications',
        description: 'Enable multi-channel notifications (Teams, Slack, Email)',
        enabled: false,
        rolloutPercentage: 0,
        environments: ['development', 'staging'],
        createdBy: 'system',
      },
    ];

    for (const flag of v2Flags) {
      const existing = await this.getAllFlags();
      const exists = existing.some(f => f.name === flag.name);
      
      if (!exists) {
        await this.createFlag(flag);
      }
    }

    logger.info('V2 feature flags initialized');
  }
}

export const featureFlagsService = new FeatureFlagsService();