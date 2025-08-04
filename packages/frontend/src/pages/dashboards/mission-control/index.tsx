import React from 'react';
import MissionControl from './MissionControl';
import { MissionControlPersistenceWrapper } from '@/components/mission-control/MissionControlPersistenceWrapper';
import { MissionControlStateRestorer } from '@/components/mission-control/MissionControlStateRestorer';
import { MissionControlEnhancer } from '@/components/mission-control/MissionControlEnhancer';
import { MissionControlButtonLayout } from '@/components/mission-control/MissionControlButtonLayout';
import { PersistedStateIndicator } from '@/components/mission-control/PersistedStateIndicator';

/**
 * Export the Mission Control with full persistence functionality
 * This includes:
 * 1. Persistence wrapper to save selections
 * 2. State restorer to restore visual state
 * 3. Enhancer to add data attributes and handle clicks
 * 4. Button layout with Clear Use Case button
 * 5. Persisted state indicator for quick navigation
 */
const MissionControlWithPersistence: React.FC = () => {
  return (
    <MissionControlPersistenceWrapper>
      <MissionControlStateRestorer>
        <MissionControlEnhancer />
        <MissionControlButtonLayout />
        <MissionControl />
        <PersistedStateIndicator />
      </MissionControlStateRestorer>
    </MissionControlPersistenceWrapper>
  );
};

export default MissionControlWithPersistence;