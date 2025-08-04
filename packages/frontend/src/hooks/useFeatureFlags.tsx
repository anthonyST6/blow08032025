import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '../services/api';

interface FeatureFlags {
  missionControlV2: boolean;
  useCaseDashboardV2: boolean;
  certificationsDashboardV2: boolean;
  vanguardAgents: boolean;
  autoFixCertifications: boolean;
  closedLoopOrchestration: boolean;
  humanInTheLoop: boolean;
  multiChannelNotifications: boolean;
}

const defaultFlags: FeatureFlags = {
  missionControlV2: false,
  useCaseDashboardV2: false,
  certificationsDashboardV2: false,
  vanguardAgents: false,
  autoFixCertifications: false,
  closedLoopOrchestration: false,
  humanInTheLoop: false,
  multiChannelNotifications: false,
};

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  loading: boolean;
  error: string | null;
  isEnabled: (flagName: keyof FeatureFlags) => boolean;
  refresh: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from API
      const response = await api.get('/v2/feature-flags');
      setFlags(response.data || defaultFlags);
    } catch (err) {
      console.error('Failed to load feature flags:', err);
      setError('Failed to load feature flags');
      
      // Enable all features in development when API fails
      setFlags({
        missionControlV2: true,
        useCaseDashboardV2: true,
        certificationsDashboardV2: true,
        vanguardAgents: true,
        autoFixCertifications: true,
        closedLoopOrchestration: true,
        humanInTheLoop: true,
        multiChannelNotifications: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (flagName: keyof FeatureFlags): boolean => {
    return flags[flagName] || false;
  };

  const refresh = () => {
    loadFeatureFlags();
  };

  return {
    flags,
    loading,
    error,
    isEnabled,
    refresh,
  };
};

export const FeatureFlagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const featureFlags = useFeatureFlags();

  return (
    <FeatureFlagsContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlagsContext = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlagsContext must be used within a FeatureFlagsProvider');
  }
  return context;
};