# Seraphim V2 Implementation Guide
## Oilfield Land Lease Use Case - Full Build Instructions

### Overview
This guide provides step-by-step instructions for implementing the complete V2 dashboard system with full agentic capabilities. All components must be built to support closed-loop orchestration, autonomous agent execution, and real-time remediation.

---

## Phase 1: Backend Infrastructure

### 1.1 New Vanguard Agents

#### Optimization Vanguard (`packages/backend/src/vanguards/optimization-vanguard.ts`)
```typescript
// Key responsibilities:
- Financial impact modeling
- Lease ROI calculations  
- Portfolio optimization
- Prescriptive recommendations
- Scenario simulation

// Required methods:
- analyzeLease(leaseData): Calculate financial metrics
- optimizePortfolio(leases[]): Recommend keep/drop/renegotiate
- simulateScenario(params): What-if analysis
- generateRecommendations(): Next best actions
```

#### Negotiation Vanguard (`packages/backend/src/vanguards/negotiation-vanguard.ts`)
```typescript
// Key responsibilities:
- Contract parsing via NLP
- Clause extraction and analysis
- Risk identification
- Negotiation package generation

// Required methods:
- parseContract(document): Extract clauses and terms
- analyzeRisks(clauses): Identify problematic terms
- generateNegotiationPackage(): Create PDF/PPT packages
- suggestClauses(): Recommend clause modifications
```

### 1.2 Core Services

#### Lease Management Service (`packages/backend/src/services/lease.service.ts`)
```typescript
// Core functionality:
- CRUD operations for leases
- Status tracking (Active, Under Review, Pending, Expiring, Expired, Terminated)
- Expiration monitoring
- Integration with ERP systems (SAP, Oracle, Quorum, Enverus)
- Agent action history tracking

// Key methods:
- getLeases(filters): Retrieve leases with status filters
- getLeaseDetails(id): Full lease metadata + agent history
- updateLeaseStatus(id, status): Change lease state
- recordAgentAction(leaseId, action): Track agent interventions
```

#### GIS Integration Service (`packages/backend/src/services/gis.service.ts`)
```typescript
// Integration targets:
- Mapbox GL JS
- ArcGIS REST API
- SharePoint for document storage

// Key features:
- Lease boundary visualization
- Risk heatmap generation
- Spatial analysis
- Infrastructure overlay
```

#### Contract Intelligence Service (`packages/backend/src/services/contract.service.ts`)
```typescript
// NLP capabilities:
- PDF/DOCX parsing
- Clause extraction
- Term identification
- Obligation tracking
- Deadline extraction

// Integration:
- OpenAI API for NLP
- Document parsing libraries
```

#### Financial Modeling Service (`packages/backend/src/services/financial.service.ts`)
```typescript
// Calculations:
- Revenue forecasting
- NPV/IRR calculations
- Risk-adjusted returns
- Portfolio optimization
- Scenario modeling
```

#### Notification Service (`packages/backend/src/services/notification.service.ts`)
```typescript
// Channels:
- Microsoft Teams (Adaptive Cards)
- Slack (Interactive Messages)
- Email (SendGrid/SMTP)
- ServiceNow tickets
- In-app notifications

// Action Package Structure:
{
  alert_id: string,
  alert_type: 'approval' | 'confirmation' | 'exception',
  summary: string,
  recommended_action: string,
  confidence: number,
  impact_estimate: string,
  buttons: ActionButton[]
}
```

#### Certification Service (`packages/backend/src/services/certification.service.ts`)
```typescript
// SIA Scoring:
- Security checks
- Integrity validation
- Accuracy verification

// Auto-fix flow:
- Detect failure → Dispatch to Vanguard → Execute fix → Recheck → Update status

// Status tracking:
- Red (failed)
- Yellow (fix in progress)
- Green (passed)
- Orange (failed after auto-fix)
```

### 1.3 API Endpoints

#### Create all V2 routes (`packages/backend/src/routes/v2/`)
```typescript
// Use Case Routes
router.get('/use-cases/:id/agents', getUseCaseAgents);
router.post('/use-cases/:id/execute', executeUseCase);
router.get('/use-cases/:id/status', getUseCaseStatus);

// Lease Routes
router.get('/leases', getLeases); // With filters
router.get('/leases/:id/full-data', getLeaseFullData);
router.post('/leases/:id/actions', executeLeaseAction);
router.get('/leases/:id/agent-history', getLeaseAgentHistory);

// Certification Routes
router.get('/certifications/status', getCertificationStatus);
router.post('/certifications/fix/:certId', triggerCertificationFix);
router.post('/certifications/recheck/:certId', recheckCertification);
router.get('/certifications/audit-log', getCertificationAuditLog);

// Agent Routes
router.post('/agents/execute', executeAgent);
router.get('/agents/status/:agentId', getAgentStatus);
router.post('/agents/action-package', createActionPackage);

// Notification Routes
router.post('/notifications/send', sendNotification);
router.get('/notifications/pending-approvals', getPendingApprovals);
```

---

## Phase 2: Frontend Implementation

### 2.1 Mission Control Dashboard V2

#### File: `packages/frontend/src/pages/dashboards/v2/MissionControlV2.tsx`

**Components to build:**

1. **VerticalSelector**
   - Dropdown with Energy & Utilities pre-selected
   - On selection, load use cases for that vertical
   - Animated transitions between verticals

2. **ExecutiveSummary**
   - Modal with 3 panels: Business Case, Technical Approach, Key Benefits
   - Brand-colored icons (use Seraphim color palette)
   - Markdown support for rich content

3. **AgentCanvas**
   - React Flow or custom canvas implementation
   - Draggable agents with collision detection
   - Connection lines showing relationships
   - Click agent → Show scrollable task list
   - Auto-layout algorithm for initial positioning

4. **WorkflowSection**
   - Expandable workflow cards
   - Show assigned agents per workflow step
   - Progress indicators
   - Execution status

5. **DeploymentConsole**
   - Real-time log streaming
   - Agent telemetry display
   - Progress bars for each agent
   - Error handling and retry mechanisms

6. **IntegrationLogs**
   - Scrollable log viewer
   - Filter by system (ERP, GIS, CLM)
   - Timestamp and severity levels
   - Export functionality

7. **DownloadsTab**
   - Generated reports (PDF, XLSX, JSON)
   - Audit trails
   - Negotiation packages
   - Compliance documents

### 2.2 Use Case Dashboard V2

#### File: `packages/frontend/src/pages/dashboards/v2/UseCaseDashboardV2.tsx`

**Components to build:**

1. **LeaseStatusGrid**
   ```typescript
   // Status categories:
   - Active: Green indicator, count badge
   - Under Review: Yellow indicator, reviewer assigned
   - Pending: Orange indicator, action required
   - Expiring Soon: Red indicator, days remaining
   - Expired: Dark red, remediation options
   - Terminated: Gray, historical view
   ```

2. **LeaseDetailModal**
   - Full lease metadata display
   - Tabbed interface:
     * Overview (key dates, parties, terms)
     * Legal Clauses (searchable, highlighted risks)
     * GIS Map (embedded Mapbox view)
     * Agent History (timeline of actions)
     * SIA Status (mini certification view)
     * Documents (attached files)
   - Next Best Action recommendations

3. **InteractiveCharts**
   - Use Chart.js or D3.js for full interactivity
   - Zoom, pan, drill-down capabilities
   - Real-time data updates
   - Export as image/data

4. **RiskHeatmap**
   - Geographic heatmap overlay
   - Color coding by risk level
   - Clickable regions → Filter leases
   - Legend with risk categories

5. **AgentActivityPanel**
   - Live feed of agent actions
   - Agent avatars with status indicators
   - Action summaries with timestamps
   - Expandable details

6. **NextBestActionFeed**
   - Prioritized recommendations from Optimization Vanguard
   - Action cards with:
     * Title and description
     * Financial impact
     * Confidence score
     * One-click execution
     * Defer/dismiss options

### 2.3 Certifications Dashboard V2

#### File: `packages/frontend/src/pages/dashboards/v2/CertificationsV2.tsx`

**Components to build:**

1. **SIAIndicators**
   ```typescript
   // Three large circles:
   - Security (Blue): Click → Security report
   - Integrity (Red): Click → Integrity report  
   - Accuracy (Green): Click → Accuracy report
   
   // States:
   - Solid color: Passed
   - Pulsing: Checking
   - Red outline: Failed
   - Yellow spinner: Fixing
   ```

2. **FailureReportPanel**
   - Full-page scrollable report
   - Sections:
     * Executive Summary
     * Detailed Findings
     * Root Cause Analysis
     * Suggested Fixes
     * Historical Trends
   - Export as PDF functionality

3. **DataLineageView**
   - Visual flow diagram
   - Source → Transformation → Destination
   - Highlight problem areas
   - Drill-down capabilities

4. **AutoFixTracker**
   - Real-time fix progress
   - Agent assignment display
   - Step-by-step fix details
   - Success/failure indicators
   - Retry mechanisms

5. **AuditLogViewer**
   - Comprehensive audit trail
   - Filters:
     * By agent
     * By action type
     * By date range
     * By severity
   - Immutable record display
   - Export functionality

### 2.4 Shared Components

#### Location: `packages/frontend/src/components/v2/shared/`

1. **AgentCard**
   - Reusable agent display component
   - Status indicator (operational/busy/error)
   - Task count badge
   - Click for details

2. **ActionPackage**
   - Notification display component
   - Action buttons
   - Countdown timer for urgent actions
   - Approval/rejection handling

3. **NotificationHandler**
   - WebSocket connection manager
   - Toast notifications
   - Action queue management
   - Channel routing (Teams/Slack/Email)

4. **ChartComponents**
   - Reusable chart wrappers
   - Consistent styling
   - Interactive features
   - Data export

---

## Phase 3: Integration & Orchestration

### 3.1 Closed-Loop Implementation

```typescript
// Workflow:
1. Issue Detection (Vanguard identifies problem)
2. Classification (Determine severity and type)
3. Action Generation (Create fix package)
4. Approval Check (Human-in-loop if needed)
5. Execution (Push to source systems)
6. Verification (Recheck certification)
7. Status Update (Update UI and logs)
```

### 3.2 WebSocket Implementation

```typescript
// Real-time updates for:
- Agent status changes
- Certification updates
- New notifications
- Lease status changes
- Workflow progress
```

### 3.3 Feature Flags

```typescript
// Environment variables:
REACT_APP_V2_ENABLED=true
REACT_APP_AGENT_LIVE=true
REACT_APP_GIS_ENABLED=true
REACT_APP_ALERTS_ENABLED=true

// Usage:
if (FEATURE_FLAGS.SERAPHIM_V2_DASHBOARDS) {
  // Show V2 routes
}
```

---

## Phase 4: External Integrations

### 4.1 ERP Systems
- SAP: REST API integration
- Oracle: SOAP/REST hybrid
- Quorum: Direct database access
- Enverus: API integration

### 4.2 GIS Systems
- ArcGIS: REST API
- SharePoint: Graph API
- Mapbox: GL JS SDK

### 4.3 Communication Platforms
- Teams: Graph API + Bot Framework
- Slack: Web API + Events API
- ServiceNow: REST API
- Email: SendGrid API

---

## Phase 5: Testing & Deployment

### 5.1 Testing Requirements
- Unit tests for all services
- Integration tests for workflows
- E2E tests for critical paths
- Performance tests for real-time features
- Security penetration testing

### 5.2 Deployment Steps
1. Deploy backend services
2. Run database migrations
3. Configure external integrations
4. Deploy frontend with feature flags OFF
5. Test in staging environment
6. Enable feature flags for beta users
7. Monitor and iterate
8. Full production rollout

---

## Critical Implementation Notes

1. **Every component must be action-oriented** - No passive displays
2. **All charts must be interactive** - Zoom, filter, export
3. **Agent actions must be traceable** - Full audit trail
4. **Failures must trigger fixes** - Not just reports
5. **Human approval only when necessary** - Automate low-risk actions
6. **Real-time updates are mandatory** - Use WebSockets
7. **Mobile responsiveness** - All dashboards must work on tablets

---

## Success Criteria

- [ ] All three dashboards fully functional
- [ ] Five Vanguard agents operational
- [ ] Closed-loop remediation working
- [ ] Multi-channel notifications active
- [ ] GIS integration complete
- [ ] Contract NLP processing accurate
- [ ] Financial modeling validated
- [ ] Auto-fix success rate > 80%
- [ ] Human approval time < 5 minutes
- [ ] System uptime > 99.9%