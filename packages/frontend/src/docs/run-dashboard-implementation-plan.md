# Run Dashboard Implementation Plan

## Objective
Create an EXACT copy of the oilfield land lease demo dashboard for the run dashboard, with the only differences being:
1. ADD the Data Ingestion tab
2. Remove all data from fields (empty state)

## Demo Dashboard Structure Analysis

### Overview Tab Components
1. **Key Metrics Cards** (4 cards)
   - Total Leases
   - Total Acres
   - Annual Revenue
   - Compliance Score

2. **Critical Lease Expirations - Next 365 Days**
   - Red/Yellow alert boxes with:
     - Lease name and wells
     - Days until expiry
     - Current rate vs Market rate
     - Production impact
     - Renewal status

3. **Lease Renewal Timeline** (Bar Chart)
   - X-axis: Time periods (0-30, 31-60, etc.)
   - Y-axis: Lease count and Revenue impact
   - Dual axis chart

4. **Production Revenue by Well Type** (Pie Chart)
   - Horizontal Wells
   - Vertical Wells
   - Directional Wells
   - Injection Wells

5. **Lease Status Distribution**
   - Active, Pending, Under Review, Expiring Soon
   - Expandable list showing lease details
   - Compliance indicators (3 dots)

6. **VANGUARDS Active Workflows**
   - Workflow name
   - Priority badge (Critical/High/Medium)
   - Progress bar
   - Status text

### Additional Tabs
- **Land Leases**: Inventory table with details panel
- **Compliance**: Category cards with scores and requirements
- **Financial**: Revenue charts and projections
- **Analytics**: Performance metrics
- **Operations**: System status

## Implementation Steps

### Step 1: Create OilfieldLandLeaseRunDashboard Component
```typescript
// packages/frontend/src/pages/dashboards/OilfieldLandLeaseRunDashboard.tsx
- Copy exact structure from UseCaseDashboard.tsx (lines 4858-5141)
- Add Data Ingestion tab
- Implement empty states for all data
```

### Step 2: Empty State Data Structure
```typescript
const emptyDashboardData = {
  metrics: [
    { name: 'Total Leases', value: 0, unit: '', trend: 'up', change: 0 },
    { name: 'Total Acres', value: 0, unit: '', trend: 'up', change: 0 },
    { name: 'Annual Revenue', value: 0, unit: 'M', trend: 'up', change: 0 },
    { name: 'Compliance Score', value: 0, unit: '%', trend: 'up', change: 0 },
  ],
  criticalExpirations: [],
  leaseRenewalTimeline: [],
  productionByWellType: [],
  leaseStatuses: [
    { status: 'Active', count: 0, color: 'text-green-500' },
    { status: 'Pending', count: 0, color: 'text-yellow-500' },
    { status: 'Under Review', count: 0, color: 'text-blue-500' },
    { status: 'Expiring Soon', count: 0, color: 'text-orange-500' },
  ],
  activeWorkflows: [],
  landLeases: [],
  revenueData: [],
  // ... other empty arrays
};
```

### Step 3: Empty State UI Components
Each section should show:
- Placeholder graphics/icons
- "No data available" message
- Call-to-action: "Ingest data to populate this section"

### Step 4: Data Ingestion Tab
- File upload interface
- Data mapping configuration
- Preview of ingested data
- "Process Data" button that populates all tabs

### Step 5: Data Flow
1. User uploads data in Data Ingestion tab
2. Data is transformed using oilfieldDataTransformer.service.ts
3. Transformed data populates Zustand store
4. All tabs automatically update with live data

## Component Hierarchy
```
OilfieldLandLeaseRunDashboard
├── Header (with SIA metrics)
├── Tab Navigation (with Data Ingestion added)
└── Tab Content
    ├── Overview Tab
    │   ├── MetricsCards
    │   ├── CriticalExpirations
    │   ├── LeaseRenewalChart
    │   ├── ProductionPieChart
    │   ├── LeaseStatusList
    │   └── ActiveWorkflows
    ├── Data Ingestion Tab
    │   ├── FileUpload
    │   ├── DataPreview
    │   └── ProcessButton
    ├── Land Leases Tab
    ├── Compliance Tab
    ├── Financial Tab
    ├── Analytics Tab
    └── Operations Tab
```

## Key Differences from Demo
1. **Data Ingestion Tab**: New tab not in demo
2. **Empty States**: All data fields start empty
3. **CTAs**: "Ingest data" buttons throughout
4. **Live Data**: Once ingested, data is live/editable

## Success Criteria
- [ ] Run dashboard looks EXACTLY like demo dashboard
- [ ] All components match demo styling and layout
- [ ] Data Ingestion tab is seamlessly integrated
- [ ] Empty states are clear and actionable
- [ ] Data flows correctly from ingestion to all tabs
- [ ] All tabs are present and functional