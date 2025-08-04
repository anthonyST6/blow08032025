# V2 to Mission Control Migration Plan

## Overview
This document outlines the complete migration plan for renaming all "v2" references to "Mission Control" and existing "mission-control" to "Mission Control OLD".

## Directory Structure Changes

### Frontend Directories
```
RENAME:
packages/frontend/src/components/dashboards/v2/ → packages/frontend/src/components/dashboards/mission-control/
packages/frontend/src/pages/dashboards/v2/ → packages/frontend/src/pages/dashboards/mission-control/
packages/frontend/src/components/mission-control/ → packages/frontend/src/components/mission-control-old/
```

### Backend Directories
```
RENAME:
packages/backend/src/routes/v2/ → packages/backend/src/routes/mission-control/
```

## File Renames

### Frontend Component Files
```
RENAME:
MissionControlV2.tsx → MissionControl.tsx
UseCaseDashboardV2.tsx → UseCaseDashboard.tsx
CertificationsDashboardV2.tsx → CertificationsDashboard.tsx
```

### Documentation Files
```
UPDATE REFERENCES IN:
- architecture-v2.md
- implementation-roadmap-v2.md
- seraphim-v2-summary.md
- use-case-addendum-v2.md
- V2_BUILD_SUMMARY.md
```

## Code Changes

### API Routes
```
CHANGE:
/api/v2/* → /api/mission-control/*
/v2/* → /mission-control/*
```

### Import Statements
```
EXAMPLES:
import MissionControlV2 from './pages/dashboards/v2/MissionControlV2'
→ import MissionControl from './pages/dashboards/mission-control/MissionControl'

import { agentRoutes } from './routes/v2/agent.routes'
→ import { agentRoutes } from './routes/mission-control/agent.routes'
```

### Component Names
```
RENAME:
const MissionControlV2 = () => {...}
→ const MissionControl = () => {...}

<MissionControlV2 />
→ <MissionControl />
```

### Route Definitions
```
CHANGE:
<Route path="v2/mission-control" element={<MissionControlV2 />} />
→ <Route path="mission-control" element={<MissionControl />} />
```

### Feature Flags
```
UPDATE:
mission-control-v2 → mission-control
use-case-dashboard-v2 → use-case-dashboard
certifications-dashboard-v2 → certifications-dashboard
```

## Migration Steps

1. **Create Backup** (Optional but recommended)
   - Copy current v2 directories to temporary backup location
   - Document current working state
   
   **Manual Backup Commands (Windows):**
   ```batch
   REM Create backup directory
   mkdir backup_v2_migration
   
   REM Backup frontend v2 directories
   xcopy "packages\frontend\src\components\dashboards\v2" "backup_v2_migration\frontend\components\dashboards\v2\" /E /I
   xcopy "packages\frontend\src\pages\dashboards\v2" "backup_v2_migration\frontend\pages\dashboards\v2\" /E /I
   xcopy "packages\frontend\src\components\mission-control" "backup_v2_migration\frontend\components\mission-control\" /E /I
   
   REM Backup backend v2 directories
   xcopy "packages\backend\src\routes\v2" "backup_v2_migration\backend\routes\v2\" /E /I
   ```

2. **Frontend Migration**
   - Rename directories
   - Rename component files
   - Update all imports
   - Update route definitions
   - Update component references

3. **Backend Migration**
   - Rename route directories
   - Update route definitions
   - Update API endpoint references
   - Update middleware and services

4. **Configuration Updates**
   - Update feature flags
   - Update environment variables
   - Update build configurations

5. **Documentation Updates**
   - Update all markdown files
   - Update API documentation
   - Update deployment guides

6. **Testing**
   - Run frontend build
   - Run backend build
   - Test all renamed routes
   - Verify functionality

7. **Cleanup**
   - Remove or archive old mission-control directories
   - Remove deprecated references
   - Update git history if needed

## Files Affected (Partial List)

### Frontend Files
- packages/frontend/src/App.tsx
- packages/frontend/src/components/MainLayout.tsx
- packages/frontend/src/hooks/useFeatureFlags.ts
- packages/frontend/src/services/api.ts
- All files in v2 directories

### Backend Files
- packages/backend/src/routes/index.ts
- packages/backend/dist/routes/index.js
- packages/backend/src/services/feature-flags.service.ts
- All files in v2 directories

### Configuration Files
- package.json (scripts if any reference v2)
- tsconfig files (if paths reference v2)
- Environment files

## Notes
- The old mission-control components will be temporarily kept as mission-control-old
- All v2 references in URLs, API endpoints, and code will be replaced with mission-control
- This is a breaking change for any external systems using the v2 endpoints