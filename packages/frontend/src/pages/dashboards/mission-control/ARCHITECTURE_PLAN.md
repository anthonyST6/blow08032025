# Seraphim V2 Dashboard Architecture Plan
## Oilfield Land Lease Use Case

### Overview
This document outlines the architecture for the new V2 dashboards that implement full agentic capabilities for the Oilfield Land Lease use case. The system will feature three main dashboards with closed-loop orchestration, autonomous agent execution, and real-time remediation.

### Core Principles
1. **Non-Destructive Deployment**: All V2 components will be isolated from existing dashboards
2. **Agentic First**: Every UI element connects to agent actions, not just reporting
3. **Closed-Loop Resolution**: Issues are automatically fixed, not just reported
4. **Real-Time Orchestration**: Live agent execution with human-in-the-loop when needed

### Dashboard Structure

#### 1. Mission Control Dashboard V2 (`/dashboard/mission-control-v2`)
- **Purpose**: Strategic agent deployment and orchestration
- **Key Components**:
  - Vertical/Use Case Selector
  - Executive Summary Modal
  - Agent Canvas (draggable, interactive)
  - Workflow Visualization
  - Deployment Console
  - Integration Logs
  - Downloads Tab

#### 2. Use Case Dashboard V2 (`/dashboard/use-case-v2`)
- **Purpose**: Live operational intelligence for land leases
- **Key Components**:
  - Lease Status Grid (Active, Under Review, Pending, Expiring, Expired, Terminated)
  - Lease Detail Popup (full metadata, agent history, GIS map)
  - Interactive Charts (zoomable, not static)
  - Risk Heatmap
  - Agent Activity Panel
  - Next Best Action Feed

#### 3. Certifications Dashboard V2 (`/dashboard/certifications-v2`)
- **Purpose**: Trust validation with auto-remediation
- **Key Components**:
  - SIA Circle Indicators (clickable)
  - Full Failure Reports
  - Data Lineage View
  - Agent Auto-Fix Log
  - Audit Trail Viewer
  - Recheck Controls

### Vanguard Agent Architecture

#### Existing Vanguards (Enhanced)
1. **Security Vanguard**: Policy enforcement, approval flows
2. **Integrity Vanguard**: Cross-system validation, data consistency
3. **Accuracy Vanguard**: Metadata correction, data quality

#### New Vanguards (To Be Created)
4. **Optimization Vanguard**: 
   - Financial modeling
   - Lease ROI calculations
   - Portfolio optimization
   - Prescriptive recommendations

5. **Negotiation Vanguard**:
   - Contract parsing (NLP)
   - Clause analysis
   - Negotiation package generation
   - Document preparation

### Backend Services Architecture

#### New Services Required
1. **Lease Management Service** (`/services/lease.service.ts`)
   - Lease CRUD operations
   - Status management
   - Expiration tracking

2. **GIS Integration Service** (`/services/gis.service.ts`)
   - Mapbox/ArcGIS integration
   - Lease boundary visualization
   - Spatial analysis

3. **Contract Intelligence Service** (`/services/contract.service.ts`)
   - NLP processing
   - Clause extraction
   - Risk identification

4. **Financial Modeling Service** (`/services/financial.service.ts`)
   - Revenue forecasting
   - ROI calculations
   - Portfolio optimization

5. **Notification Service** (`/services/notification.service.ts`)
   - Teams/Slack integration
   - Email notifications
   - In-app alerts

6. **Certification Service** (`/services/certification.service.ts`)
   - SIA scoring
   - Auto-fix dispatch
   - Recheck logic

### API Endpoints Structure

#### V2 API Routes
```
/api/v2/
├── /use-cases/
│   ├── GET /:id/agents
│   ├── POST /:id/execute
│   └── GET /:id/status
├── /leases/
│   ├── GET / (with filters)
│   ├── GET /:id/full-data
│   ├── POST /:id/actions
│   └── GET /:id/agent-history
├── /certifications/
│   ├── GET /status
│   ├── POST /fix/:certId
│   ├── POST /recheck/:certId
│   └── GET /audit-log
├── /agents/
│   ├── POST /execute
│   ├── GET /status/:agentId
│   └── POST /action-package
└── /notifications/
    ├── POST /send
    └── GET /pending-approvals
```

### Data Flow Architecture

```
External Systems → Ingestion Layer → Vanguard Analysis → Decision Engine → Action Execution → System Update → Certification Check → UI Update
                                                                    ↓
                                                          Human Approval (if needed)
```

### Feature Flag Implementation
```typescript
// config/features.ts
export const FEATURE_FLAGS = {
  SERAPHIM_V2_DASHBOARDS: process.env.REACT_APP_V2_ENABLED === 'true',
  AGENT_LIVE_EXECUTION: process.env.REACT_APP_AGENT_LIVE === 'true',
  GIS_INTEGRATION: process.env.REACT_APP_GIS_ENABLED === 'true',
  MULTI_CHANNEL_ALERTS: process.env.REACT_APP_ALERTS_ENABLED === 'true'
};
```

### Component Structure
```
/components/v2/
├── /mission-control/
│   ├── VerticalSelector.tsx
│   ├── ExecutiveSummary.tsx
│   ├── AgentCanvas.tsx
│   ├── WorkflowViewer.tsx
│   └── DeploymentConsole.tsx
├── /use-case/
│   ├── LeaseGrid.tsx
│   ├── LeaseDetailModal.tsx
│   ├── GISMap.tsx
│   ├── AgentActivityPanel.tsx
│   └── NextBestAction.tsx
├── /certifications/
│   ├── SIAIndicators.tsx
│   ├── FailureReport.tsx
│   ├── DataLineage.tsx
│   ├── AutoFixTracker.tsx
│   └── AuditLogViewer.tsx
└── /shared/
    ├── AgentCard.tsx
    ├── ActionPackage.tsx
    ├── NotificationHandler.tsx
    └── ChartComponents.tsx
```

### State Management
- Use React Context for dashboard-specific state
- Implement WebSocket connections for real-time updates
- Cache agent results and certification status

### Security Considerations
- All agent actions require authentication
- High-risk actions require additional approval
- Audit trail for all system modifications
- Encrypted communication with external systems

### Performance Optimization
- Lazy load dashboard components
- Implement virtual scrolling for large datasets
- Cache GIS tiles and map data
- Optimize agent execution queuing

### Testing Strategy
- Unit tests for all new components
- Integration tests for agent workflows
- E2E tests for critical user journeys
- Performance testing for real-time features

### Deployment Plan
1. Deploy backend services first
2. Enable feature flags in staging
3. Deploy frontend with V2 routes
4. Test in isolation
5. Gradual rollout with monitoring
6. Full production deployment after validation